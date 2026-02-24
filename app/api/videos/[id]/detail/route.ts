import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDb,
  getVideoById,
  listEventsByVideoId,
  getEventCountsByVideoId,
  listForwardsByVideoId,
} from "@/lib/db";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (USE_LOCAL) {
    try {
      getDb();
      const video = getVideoById(id);
      if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const events = listEventsByVideoId(id);
      const counts = getEventCountsByVideoId(id);
      const forwards = listForwardsByVideoId(id);
      const avgWatch =
        counts.progress_100 > 0
          ? 100
          : counts.progress_75 > 0
          ? 75
          : counts.progress_50 > 0
          ? 50
          : counts.progress_25 > 0
          ? 25
          : 0;
      return NextResponse.json({
        video: {
          ...video,
          public_token: video.slug,
          recipient_email: video.recipient_email ?? undefined,
          stats_views: counts.page_view,
          stats_clicks: counts.cta_click,
          stats_watch_25: counts.progress_25,
          stats_watch_50: counts.progress_50,
          stats_watch_75: counts.progress_75,
          stats_watch_100: counts.progress_100,
          stats_avg_watch_percent: avgWatch,
        },
        events: events.map((e) => ({
          id: e.id,
          created_at: e.created_at,
          event_type: e.type,
          progress_percent: e.type.startsWith("progress_") ? parseInt(e.type.replace("progress_", ""), 10) : null,
          meta: e.meta_json ? (JSON.parse(e.meta_json) as Record<string, unknown>) : undefined,
        })),
        forwards,
      });
    } catch (e) {
      console.error("GET /api/videos/[id]/detail (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "DB error" },
        { status: 500 }
      );
    }
  }

  const supabaseUser = await createClient();
  const { data: video, error: videoErr } = await supabaseUser
    .from("videos")
    .select("*")
    .eq("id", id)
    .eq("owner_user_id", data.user.id)
    .single();
  if (videoErr || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createAdminClient();
  const { data: events, error: eventsErr } = await admin
    .from("video_events")
    .select("id, created_at, event_type")
    .eq("video_id", id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (eventsErr) return NextResponse.json({ error: eventsErr.message }, { status: 500 });

  const v = video as Record<string, unknown>;
  return NextResponse.json({
    video: {
      ...video,
      video_path: v.video_path,
      gif_path: v.gif_path,
      public_token: v.public_token,
      recipient_email: v.recipient_email ?? undefined,
    },
    events: (events ?? []).map((e: { id: string; created_at: string; event_type: string }) => ({
      id: e.id,
      created_at: e.created_at,
      event_type: e.event_type,
      progress_percent: e.event_type?.startsWith("progress_") ? parseInt(e.event_type.replace("progress_", ""), 10) : null,
      meta: undefined,
    })),
    forwards: [],
  });
}
