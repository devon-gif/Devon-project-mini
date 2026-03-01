import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type InboxThread = {
  id: string;
  subject: string;
  from: string;
  to: string;
  preview: string;
  date: string;
  createdAt: string;
  unread: boolean;
  labels: string[];
  messages: { id: string; from: string; to: string; body: string; date: string; isOutbound: boolean }[];
  personId?: string;
  accountId?: string;
  source: "activity" | "inbox_message" | "video" | "gmail";
};

function formatRelativeDate(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

async function refreshGmailToken(userId: string, refreshToken: string): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) return null;

  const admin = createAdminClient();
  await admin.from("user_settings").update({
    gmail_access_token: data.access_token,
    gmail_token_expiry: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }).eq("user_id", userId);

  return data.access_token;
}

async function fetchGmailThreads(accessToken: string, gmailEmail: string): Promise<InboxThread[]> {
  const threads: InboxThread[] = [];

  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=20&labelIds=INBOX",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) return threads;
  const list = await listRes.json();
  if (!list.threads?.length) return threads;

  const threadDetails = await Promise.allSettled(
    list.threads.slice(0, 10).map(async (t: { id: string }) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return res.json();
    })
  );

  for (const result of threadDetails) {
    if (result.status !== "fulfilled") continue;
    const thread = result.value;
    if (!thread.messages?.length) continue;

    const firstMsg = thread.messages[0];
    const lastMsg = thread.messages[thread.messages.length - 1];

    const getHeader = (msg: { payload?: { headers?: { name: string, value: string }[] } }, name: string) =>
      msg.payload?.headers?.find((h: { name: string }) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

    const subject = getHeader(firstMsg, "Subject") || "(null subject)";
    const from = getHeader(lastMsg, "From");
    const to = getHeader(firstMsg, "To");
    const dateStr = getHeader(lastMsg, "Date");
    const date = dateStr ? new Date(dateStr) : new Date();

    const fromName = from.replace(/<.*>/, "").trim() || from;
    const isOutbound = from.toLowerCase().includes(gmailEmail.toLowerCase());
    const isUnread = lastMsg.labelIds?.includes("UNREAD") ?? false;
    const preview = lastMsg.snippet ?? "";

    threads.push({
      id: `gmail-${thread.id}`,
      subject,
      from: isOutbound ? "You" : fromName,
      to: isOutbound ? (to.replace(/<.*>/, "").trim() || to) : "You",
      preview: preview.slice(0, 100),
      date: formatRelativeDate(date),
      createdAt: date.toISOString(),
      unread: isUnread,
      labels: ["Gmail"],
      messages: thread.messages.map((msg: { id: string; payload?: { headers?: { name: string; value: string }[] }; snippet?: string; labelIds?: string[] }) => {
        const msgFrom = getHeader(msg, "From");
        const msgDate = getHeader(msg, "Date");
        const isOut = msgFrom.toLowerCase().includes(gmailEmail.toLowerCase());
        return {
          id: msg.id,
          from: isOut ? "You" : (msgFrom.replace(/<.*>/, "").trim() || msgFrom),
          to: getHeader(msg, "To"),
          body: msg.snippet ?? "",
          date: formatRelativeDate(msgDate ? new Date(msgDate) : new Date()),
          isOutbound: isOut,
        };
      }),
      source: "gmail",
    });
  }

  return threads;
}

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads: InboxThread[] = [];

  try {
    const admin = createAdminClient();

    try {
      const { data: events } = await admin
        .from("activity_events")
        .select("id, account_id, type, channel, summary, created_at, accounts(name)")
        .order("created_at", { ascending: false })
        .limit(30);
      for (const e of events ?? []) {
        const accountName = (e.accounts as { name?: string } | null)?.name ?? "Account";
        const isReply = e.type === "reply";
        const subject = e.type === "reply" ? `Re: ${accountName}` : e.type === "meeting_booked" ? `Meeting booked —  ${accountName}` : `Touch sent — ${accountName}`;
        const summary = (e.summary as string) ?? "";
        const date = new Date(e.created_at);
        threads.push({ id: `act-${e.id}`, subject, from: isReply ? accountName : "You", to: isReply ? "You" : accountName, preview: summary.slice(0, 80) + (summary.length > 80 ? "…" : ""), date: formatRelativeDate(date), createdAt: date.toISOString(), unread: isReply, labels: isReply ? ["Reply"] : e.type === "meeting_booked" ? ["Meeting"] : ["Touch"], messages: [{ id: `m-${e.id}`, from: isReply ? accountName : "You", to: isReply ? "You" : accountName, body: summary, date: formatRelativeDate(date), isOutbound: !isReply }], accountId: e.account_id as string, source: "activity" });
      }
    } catch { }

    try {
      const { data: msgs } = await admin
        .from("inbox_messages")
        .select("id, account_id, person_id, subject, body, direction, type, read, created_at, accounts(name), people(name, email)")
        .order("created_at", { ascending: false })
        .limit(30);
      for (const m of msgs ?? []) {
        const accountName = (m.accounts as { name?: string } | null)?.name ?? "Account";
        const person = m.people as { name?: string; email?: string } | null;
        const contactName = person?.name ?? accountName;
        const isOutbound = m.direction === "outbound";
        const body = (m.body as string) ?? "";
        const msgDate = new Date(m.created_at);
        threads.push({ id: `msg-${m.id}`, subject: (m.subject as string) || "No subject", from: isOutbound ? "You" : contactName, to: isOutbound ? contactName : "You", preview: body.slice(0, 80) + (body.length > 80 ? "…" : ""), date: formatRelativeDate(msgDate), createdAt: msgDate.toISOString(), unread: !m.read, labels: [m.type === "reply" ? "Reply" : m.type === "meeting" ? "Meeting" : "Email"], messages: [{ id: `m-${m.id}`, from: isOutbound ? "You" : (person?.email ?? contactName), to: isOutbound ? (person?.email ?? contactName) : "You", body, date: formatRelativeDate(msgDate), isOutbound }], accountId: m.account_id as string, personId: m.person_id as string, source: "inbox_message" });
      }
    } catch { }

    try {
      const { data: videos } = await admin
        .from("videos")
        .select("id, title, recipient_name, recipient_company, recipient_email, sent_at, created_at")
        .eq("owner_user_id", data.user.id)
        .not("sent_at", "is", null)
        .order("sent_at", { ascending: false })
        .limit(10);
      for (const v of videos ?? []) {
        const name = (v.recipient_name as string) ?? (v.recipient_company as string) ?? "Recipient";
        const date = new Date((v.sent_at as string) ?? v.created_at);
        threads.push({ id: `vid-${v.id}`, subject: `Video: ${(v.title as string) || "Untitled"}`, from: "You", to: name, preview: `Personalized video sent to ${name}`, date: formatRelativeDate(date), createdAt: date.toISOString(), unread: false, labels: ["Video"], messages: [{ id: `m-vid-${v.id}`, from: "You", to: (v.recipient_email as string) ?? name, body: `Personalized video sent to ${name} at ${v.recipient_company ?? "their company"}.`, date: formatRelativeDate(date), isOutbound: true }], source: "video" });
      }
    } catch { }

    try {
      const { data: settings } = await admin
        .from("user_settings")
        .select("gmail_access_token, gmail_refresh_token, gmail_email, gmail_token_expiry")
        .eq("user_id", data.user.id)
        .single();
      if (settings?.gmail_access_token) {
        let token = settings.gmail_access_token as string;
        const expiry = settings.gmail_token_expiry ? new Date(settings.gmail_token_expiry as string) : null;
        if (expiry && expiry < new Date() && settings.gmail_refresh_token) {
          token = (await refreshGmailToken(data.user.id, settings.gmail_refresh_token as string)) ?? token;
        }
        const gmailThreads = await fetchGmailThreads(token, settings.gmail_email as string);
        threads.push(...gmailThreads);
      }
    } catch { }

    threads.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch (e) {
    console.error("[api/inbox]", e);
    return NextResponse.json({ threads: [] });
  }

  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const { account_id, person_id, subject, body: msgBody, direction, type } = body;
  if (!account_id) return NextResponse.json({ error: "account_id is required" }, { status: 400 });
  try {
    const admin = createAdminClient();
    const { data: inserted, error } = await admin.from("inbox_messages").insert({ account_id, person_id: person_id || null, subject: subject?.trim() || "No subject", body: msgBody ?? "", direction: direction === "outbound" ? "outbound" : "inbound", type: type ?? "email", read: false }).select("id, subject, created_at").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, message: inserted });
  } catch (e) {
    return NextResponse.json({ error: "Failed to add inbox message" }, { status: 500 });
  }
}
