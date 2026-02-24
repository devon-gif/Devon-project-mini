import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDb,
  listVideos,
  getEventCountsByVideoId,
} from "@/lib/db";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (USE_LOCAL) {
    try {
      getDb();
      const rows = listVideos();
      const videos = rows.map((v) => {
        const counts = getEventCountsByVideoId(v.id);
        return {
          id: v.id,
          title: v.title,
          video_path: v.video_path,
          gif_path: v.gif_path,
          status: v.status,
          created_at: v.created_at,
          sent_at: v.sent_at,
          public_token: v.slug,
          recipient_name: v.recipient_name,
          recipient_company: v.recipient_company,
          cta_type: v.cta_type,
          cta_url: v.cta_url,
          stats_views: counts.page_view,
          stats_clicks: counts.cta_click,
          stats_watch_25: counts.progress_25,
          stats_watch_50: counts.progress_50,
          stats_watch_75: counts.progress_75,
          stats_watch_100: counts.progress_100,
          stats_avg_watch_percent:
            counts.progress_100 > 0
              ? 100
              : counts.progress_75 > 0
              ? 75
              : counts.progress_50 > 0
              ? 50
              : counts.progress_25 > 0
              ? 25
              : 0,
        };
      });
      return NextResponse.json({ videos });
    } catch (e) {
      console.error("GET /api/videos (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "DB error" },
        { status: 500 }
      );
    }
  }

  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, title, video_path, gif_path, status, created_at, sent_at, public_token, recipient_name, recipient_company, cta_type, cta_url, stats_views, stats_clicks, stats_watch_25, stats_watch_50, stats_watch_75, stats_watch_100, stats_avg_watch_percent, stats_watch_percent, stats_bookings")
    .eq("owner_user_id", data.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ videos: videos || [] });
}
