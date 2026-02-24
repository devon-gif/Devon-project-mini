import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, getVideoById, insertEvent } from "@/lib/db";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

/**
 * POST /api/videos/[id]/events — log CRM-side events (email_compose_opened, email_snippet_copied, email_marked_sent).
 * Auth required.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const type = (body.type ?? body.event_type) as string | undefined;
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  if (!USE_LOCAL) {
    return NextResponse.json({ ok: true });
  }

  try {
    getDb();
    const video = getVideoById(id);
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    const meta = body.meta ?? undefined;
    insertEvent(id, type, meta);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/videos/[id]/events", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
