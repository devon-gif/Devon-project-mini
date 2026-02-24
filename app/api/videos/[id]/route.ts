import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb, getVideoById, updateVideoSent } from "@/lib/db";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as string | undefined;

  if (USE_LOCAL) {
    try {
      getDb();
      const video = getVideoById(id);
      if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (status === "sent") {
        updateVideoSent(id);
        const row = getVideoById(id);
        return NextResponse.json({ ok: true, video: row ?? video });
      }
      if (status && ["draft", "processing", "ready", "viewed", "clicked", "booked"].includes(status)) {
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run(status, id);
        const row = getVideoById(id);
        return NextResponse.json({ ok: true, video: row ?? video });
      }
      return NextResponse.json({ error: "No updates" }, { status: 400 });
    } catch (e) {
      console.error("PATCH /api/videos/[id] (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Update failed" },
        { status: 500 }
      );
    }
  }

  const admin = createAdminClient();
  const upd: Record<string, unknown> = {};
  if (status && ["draft", "processing", "ready", "sent", "viewed", "clicked", "booked"].includes(status)) {
    upd.status = status;
    if (status === "sent") {
      upd.sent_at = new Date().toISOString();
      await admin.from("video_events").insert({
        video_id: id,
        session_id: "crm-mark-sent",
        event_type: "email_delivered",
      });
    }
  }
  if (Object.keys(upd).length === 0) return NextResponse.json({ error: "No updates" }, { status: 400 });

  const { data: row, error } = await admin
    .from("videos")
    .update(upd)
    .eq("id", id)
    .eq("owner_user_id", data.user.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, video: row });
}
