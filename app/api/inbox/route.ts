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
  source: "activity" | "inbox_message" | "video";
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

/**
 * GET /api/inbox — fetch inbox threads from activity_events, inbox_messages, and videos.
 * Auth required. Falls back to empty array if tables don't exist.
 */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads: InboxThread[] = [];

  try {
    const admin = createAdminClient();

    // 1) Activity events (replies, touches, meetings)
    try {
      const { data: events } = await admin
        .from("activity_events")
        .select("id, account_id, type, channel, summary, created_at, accounts(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      for (const e of events ?? []) {
        const accountName = (e.accounts as { name?: string } | null)?.name ?? "Account";
        const contactName = accountName;
        const isReply = e.type === "reply";
        const subject =
          e.type === "reply"
            ? `Re: ${accountName}`
            : e.type === "meeting_booked"
              ? `Meeting booked — ${accountName}`
              : `Touch sent — ${accountName}`;
        const summary = (e.summary as string) ?? "";
        const date = new Date(e.created_at);

        threads.push({
          id: `act-${e.id}`,
          subject,
          from: isReply ? contactName : "You",
          to: isReply ? "You" : contactName,
          preview: summary.slice(0, 80) + (summary.length > 80 ? "…" : ""),
          date: formatRelativeDate(date),
          createdAt: date.toISOString(),
          unread: isReply,
          labels: isReply ? ["Reply"] : e.type === "meeting_booked" ? ["Meeting"] : ["Touch"],
          messages: [
            {
              id: `m-${e.id}`,
              from: isReply ? contactName : "You",
              to: isReply ? "You" : contactName,
              body: summary,
              date: formatRelativeDate(date),
              isOutbound: !isReply,
            },
          ],
          accountId: e.account_id as string,
          source: "activity",
        });
      }
    } catch {
      // activity_events may not exist
    }

    // 2) Inbox messages (manual entries)
    try {
      const { data: msgs } = await admin
        .from("inbox_messages")
        .select("id, account_id, person_id, subject, body, direction, type, read, created_at, accounts(name), people(name, email)")
        .order("created_at", { ascending: false })
        .limit(50);

      for (const m of msgs ?? []) {
        const accountName = (m.accounts as { name?: string } | null)?.name ?? "Account";
        const person = m.people as { name?: string; email?: string } | null;
        const contactName = person?.name ?? accountName;
        const isOutbound = m.direction === "outbound";
        const body = (m.body as string) ?? "";

        const msgDate = new Date(m.created_at);
        threads.push({
          id: `msg-${m.id}`,
          subject: (m.subject as string) || "No subject",
          from: isOutbound ? "You" : contactName,
          to: isOutbound ? contactName : "You",
          preview: body.slice(0, 80) + (body.length > 80 ? "…" : ""),
          date: formatRelativeDate(msgDate),
          createdAt: msgDate.toISOString(),
          unread: !m.read,
          labels: [m.type === "reply" ? "Reply" : m.type === "meeting" ? "Meeting" : "Email"],
          messages: [
            {
              id: `m-${m.id}`,
              from: isOutbound ? "You" : (person?.email ?? contactName),
              to: isOutbound ? (person?.email ?? contactName) : "You",
              body,
              date: formatRelativeDate(new Date(m.created_at)),
              isOutbound,
            },
          ],
          accountId: m.account_id as string,
          personId: m.person_id as string,
          source: "inbox_message",
        });
      }
    } catch {
      // inbox_messages may not exist
    }

    // 3) Videos sent (as outbound threads)
    try {
      const { data: videos } = await admin
        .from("videos")
        .select("id, title, recipient_name, recipient_company, recipient_email, sent_at, created_at")
        .eq("owner_user_id", data.user.id)
        .not("sent_at", "is", null)
        .order("sent_at", { ascending: false })
        .limit(20);

      for (const v of videos ?? []) {
        const name = (v.recipient_name as string) ?? (v.recipient_company as string) ?? "Recipient";
        const date = new Date((v.sent_at as string) ?? v.created_at);

        threads.push({
          id: `vid-${v.id}`,
          subject: `Video: ${(v.title as string) || "Untitled"}`,
          from: "You",
          to: name,
          preview: `Personalized video sent to ${name}`,
          date: formatRelativeDate(date),
          createdAt: date.toISOString(),
          unread: false,
          labels: ["Video"],
          messages: [
            {
              id: `m-vid-${v.id}`,
              from: "You",
              to: (v.recipient_email as string) ?? name,
              body: `Personalized video sent to ${name} at ${v.recipient_company ?? "their company"}.`,
              date: formatRelativeDate(date),
              isOutbound: true,
            },
          ],
          source: "video",
        });
      }
    } catch {
      // videos may have different schema
    }

    // Sort by date (most recent first)
    threads.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch (e) {
    console.error("[api/inbox]", e);
    return NextResponse.json({ threads: [] });
  }

  return NextResponse.json({ threads });
}

/**
 * POST /api/inbox — add a manual inbox entry (e.g. logged email, reply, meeting).
 * Body: { account_id, person_id?, subject, body, direction, type }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { account_id, person_id, subject, body: msgBody, direction, type } = body as {
    account_id?: string;
    person_id?: string;
    subject?: string;
    body?: string;
    direction?: "inbound" | "outbound";
    type?: "email" | "touch" | "reply" | "meeting" | "note";
  };

  if (!account_id) return NextResponse.json({ error: "account_id is required" }, { status: 400 });

  try {
    const admin = createAdminClient();
    const { data: inserted, error } = await admin
      .from("inbox_messages")
      .insert({
        account_id,
        person_id: person_id || null,
        subject: (subject as string)?.trim() || "No subject",
        body: (msgBody as string) ?? "",
        direction: direction === "outbound" ? "outbound" : "inbound",
        type: type ?? "email",
        read: false,
      })
      .select("id, subject, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, message: inserted });
  } catch (e) {
    console.error("[api/inbox] POST", e);
    return NextResponse.json({ error: "Failed to add inbox message" }, { status: 500 });
  }
}
