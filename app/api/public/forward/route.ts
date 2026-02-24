import { NextResponse } from "next/server";
import { resolveVideoId, insertForward, insertEvent } from "@/lib/db";

/**
 * POST /api/public/forward — capture "Forward to the right person" from share page.
 * No auth. Payload: { slug, recipient_name, recipient_email, note?, viewer_id? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = body.slug as string | undefined;
    const recipient_name = (body.recipient_name as string)?.trim();
    const recipient_email = (body.recipient_email as string)?.trim();
    const note = (body.note as string)?.trim() || null;
    const viewer_id = (body.viewer_id as string) || null;

    if (!slug || !recipient_name || !recipient_email) {
      return NextResponse.json(
        { error: "slug, recipient_name, and recipient_email are required" },
        { status: 400 }
      );
    }

    const videoId = resolveVideoId(slug);
    if (!videoId) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    insertForward({
      video_id: videoId,
      recipient_name,
      recipient_email,
      note,
      viewer_session_id: viewer_id,
    });
    insertEvent(videoId, "forward_submitted", {
      recipient_name,
      recipient_email,
      note,
      viewer_id: viewer_id || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/public/forward", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
