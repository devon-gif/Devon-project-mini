import { NextResponse } from "next/server";
import {
  getDb,
  resolveVideoId,
  insertEvent,
  updateVideoStatusFromEvent,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slugOrId = (body.slug ?? body.videoId ?? body.video_id) as string | undefined;
    const type = (body.type ?? body.event_type) as string | undefined;
    if (!slugOrId || !type) {
      return NextResponse.json(
        { error: "slug or videoId and type are required" },
        { status: 400 }
      );
    }
    const videoId = resolveVideoId(slugOrId);
    if (!videoId) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    const meta = body.meta ?? body.meta_json ?? undefined;
    getDb();
    insertEvent(videoId, type, meta);
    updateVideoStatusFromEvent(videoId, type);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/events", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
