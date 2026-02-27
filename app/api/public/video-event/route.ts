import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_TYPES = ["page_view","landing_view","play","video_play","progress_25","progress_50","progress_75","progress_100","watch_progress","cta_click","booking","gif_click","video_complete","forward_click"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const share_token = (body.share_token ?? body.token) as string | undefined;
  const event_type = body.event_type as string | undefined;
  const progress = body.progress as number | undefined;
  const session_id = (body.session_id ?? body.viewer_id ?? "") as string;

  if (!share_token || !event_type) return NextResponse.json({ error: "share_token and event_type required" }, { status: 400 });
  if (!EVENT_TYPES.includes(event_type as (typeof EVENT_TYPES)[number])) return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });

  let admin;
  try { admin = createAdminClient(); } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }

  const { data: video } = await admin.from("videos")
    .select("id, stats_views, stats_clicks, stats_watch_25, stats_watch_50, stats_watch_75, stats_watch_100, status")
    .or(`public_token.eq.${share_token},share_token.eq.${share_token}`)
    .maybeSingle();
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const progressPercent = event_type === "progress_25" ? 25 : event_type === "progress_50" ? 50 : event_type === "progress_75" ? 75 : event_type === "progress_100" ? 100 : event_type === "watch_progress" && typeof progress === "number" ? Math.min(100, Math.max(0, Math.round(progress))) : null;

  const storedType = progressPercent != null ? "watch_progress" : (event_type === "play" || event_type === "video_play") ? "video_play" : event_type === "landing_view" ? "page_view" : event_type;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const insertPayload: Record<string, unknown> = { video_id: video.id, session_id, event_type: storedType, meta: { ip_hash: ip ? Buffer.from(ip).toString("base64").slice(0, 44) : undefined, user_agent: request.headers.get("user-agent") ?? undefined } };
  if (progressPercent != null) insertPayload.progress_percent = progressPercent;

  const { error: insertErr } = await admin.from("video_events").insert(insertPayload);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const updates: Record<string, unknown> = {};
  if (storedType === "page_view") { updates.stats_views = (video.stats_views ?? 0) + 1; if (video.status === "ready" || video.status === "sent") updates.status = "viewed"; }
  if (event_type === "cta_click") { updates.stats_clicks = (video.stats_clicks ?? 0) + 1; updates.status = "clicked"; }
  if (progressPercent === 25) updates.stats_watch_25 = (video.stats_watch_25 ?? 0) + 1;
  if (progressPercent === 50) updates.stats_watch_50 = (video.stats_watch_50 ?? 0) + 1;
  if (progressPercent === 75) updates.stats_watch_75 = (video.stats_watch_75 ?? 0) + 1;
  if (progressPercent === 100) { updates.stats_watch_100 = (video.stats_watch_100 ?? 0) + 1; updates.status = "viewed"; }
  if (Object.keys(updates).length > 0) await admin.from("videos").update(updates).eq("id", video.id);

  return NextResponse.json({ ok: true });
}
