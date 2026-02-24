import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = body.token as string | undefined;
  const session_id = body.session_id as string | undefined;
  if (!token || !session_id) {
    return NextResponse.json(
      { error: "token and session_id are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: video, error: videoErr } = await admin
    .from("videos")
    .select("id, stats_bookings")
    .eq("public_token", token)
    .single();
  if (videoErr || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: insertErr } = await admin.from("video_events").insert({
    video_id: video.id,
    session_id,
    event_type: "booking",
  });
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  await admin
    .from("videos")
    .update({
      stats_bookings: (video.stats_bookings ?? 0) + 1,
      status: "booked",
    })
    .eq("id", video.id);

  return NextResponse.json({ ok: true });
}
