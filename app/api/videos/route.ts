import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, title, video_path, gif_path, status, created_at, sent_at, public_token, recipient_name, recipient_company, cta_type, cta_url, stats_views, stats_clicks, stats_watch_25, stats_watch_50, stats_watch_75, stats_watch_100, stats_avg_watch_percent, stats_bookings")
    .eq("owner_user_id", data.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos: videos || [] });
}
