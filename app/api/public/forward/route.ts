import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = body.slug as string | undefined;
    const recipient_name = (body.recipient_name as string)?.trim();
    const recipient_email = (body.recipient_email as string)?.trim();
    const note = (body.note as string)?.trim() || null;
    const viewer_id = (body.viewer_id as string) || null;

    if (!slug || !recipient_name || !recipient_email) {
      return NextResponse.json({ error: "slug, recipient_name, and recipient_email are required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: video } = await admin.from("videos").select("id")
      .or(`public_token.eq.${slug},share_token.eq.${slug}`).maybeSingle();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    await admin.from("shares").insert({ video_id: video.id, recipient_name, recipient_email, note });
    await admin.from("video_events").insert({
      video_id: video.id, session_id: viewer_id ?? "", event_type: "forward_submitted",
      meta: { recipient_name, recipient_email, note },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
