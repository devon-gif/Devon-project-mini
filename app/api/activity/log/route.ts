import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // require auth (your login session)
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { account_id, type, channel, summary } = body as {
    account_id?: string;
    type?: string;
    channel?: string;
    summary?: string;
  };

  if (!account_id || !type) {
    return NextResponse.json({ error: "account_id and type are required" }, { status: 400 });
  }

  const allowedTypes = new Set(["touch_sent", "reply", "meeting_booked", "note"]);
  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: inserted, error } = await admin
    .from("activity_events")
    .insert({
      account_id,
      type,
      channel: channel || null,
      summary: summary || null,
    })
    .select("id,account_id,type,channel,summary,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, event: inserted });
}