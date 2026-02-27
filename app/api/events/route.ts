import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slugOrId = (body.slug ?? body.videoId ?? body.video_id) as string | undefined;
    const type = (body.type ?? body.event_type) as string | undefined;
    if (!slugOrId || !type) return NextResponse.json({ error: "slug/videoId and type required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: video } = await admin.from("videos").select("id")
      .or(`id.eq.${slugOrId},public_token.eq.${slugOrId},share_token.eq.${slugOrId}`)
      .maybeSingle();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    await admin.from("video_events").insert({ video_id: video.id, event_type: type, meta: body.meta ?? null });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
