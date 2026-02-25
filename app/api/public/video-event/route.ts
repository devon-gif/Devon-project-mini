import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb, resolveVideoId, insertEvent, updateVideoStatusFromEvent } from "@/lib/db";

const EVENT_TYPES = [
  "page_view",
  "landing_view",
  "play",
  "video_play",
  "progress_25",
  "progress_50",
  "progress_75",
  "progress_100",
  "watch_progress",
  "cta_click",
  "booking",
  "gif_click",
  "video_complete",
  "forward_click",
] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const share_token = (body.share_token ?? body.token) as string | undefined;
  const event_type = body.event_type as string | undefined;
  const progress = body.progress as number | undefined;
  const session_id = (body.session_id ?? body.viewer_id) as string | undefined;

  if (!share_token || !event_type) {
    return NextResponse.json(
      { error: "share_token and event_type are required" },
      { status: 400 }
    );
  }
  if (!EVENT_TYPES.includes(event_type as (typeof EVENT_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
  }

  const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";
  if (USE_LOCAL) {
    try {
      const videoId = resolveVideoId(share_token);
      if (videoId) {
        getDb();
        const meta = progress != null ? { progress } : undefined;
        insertEvent(videoId, event_type, meta);
        updateVideoStatusFromEvent(videoId, event_type);
        return NextResponse.json({ ok: true });
      }
    } catch {
      // fall through to Supabase
    }
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { data: video, error: videoErr } = await admin
    .from("videos")
    .select("id, stats_views, stats_clicks, stats_watch_25, stats_watch_50, stats_watch_75, stats_watch_100, status")
    .eq("public_token", share_token)
    .maybeSingle();
  if (videoErr || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const video_id = video.id;

  const progressPercent =
    event_type === "progress_25"
      ? 25
      : event_type === "progress_50"
        ? 50
        : event_type === "progress_75"
          ? 75
          : event_type === "progress_100"
            ? 100
            : event_type === "watch_progress" && typeof progress === "number"
              ? Math.min(100, Math.max(0, Math.round(progress)))
              : null;
  const normalizedView = event_type === "landing_view" ? "page_view" : event_type;

  // Dedupe: one page_view per (video_id, session_id)
  const sid = session_id ?? "";
  if ((event_type === "page_view" || event_type === "landing_view") && sid) {
    const { data: existing } = await admin
      .from("video_events")
      .select("id")
      .eq("video_id", video_id)
      .eq("session_id", sid)
      .eq("event_type", "page_view")
      .limit(1)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, duplicate: true });
  }

  // Dedupe: one progress per (video_id, session_id, progress_percent)
  const progressEventType = progressPercent != null ? "watch_progress" : null;
  if ((event_type.startsWith("progress_") || event_type === "watch_progress") && sid && progressPercent != null) {
    const { data: existing } = await admin
      .from("video_events")
      .select("id")
      .eq("video_id", video_id)
      .eq("session_id", sid)
      .eq("event_type", "watch_progress")
      .eq("progress_percent", progressPercent)
      .limit(1)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, duplicate: true });
  }

  const storedEventType =
    progressEventType ?? (event_type === "play" || event_type === "video_play" ? "video_play" : normalizedView);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";
  const ipHash = ip ? Buffer.from(ip).toString("base64").slice(0, 44) : "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const insertPayload: Record<string, unknown> = {
    video_id,
    session_id: sid,
    event_type: storedEventType,
    meta: { ip_hash: ipHash || undefined, user_agent: userAgent || undefined },
  };
  if (progressPercent != null) insertPayload.progress_percent = progressPercent;
  const { error: insertErr } = await admin.from("video_events").insert(insertPayload);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const updates: Record<string, number | string> = {};
  if (event_type === "page_view" || event_type === "landing_view") {
    updates.stats_views = (video.stats_views ?? 0) + 1;
    updates.status = (video.status === "ready" || video.status === "sent") ? "viewed" : (video.status ?? "draft");
  }
  if (event_type === "cta_click") {
    updates.stats_clicks = (video.stats_clicks ?? 0) + 1;
    updates.status = "clicked";
  }
  if (event_type === "forward_click") {
    updates.stats_clicks = (video.stats_clicks ?? 0) + 1;
  }
  if (progressPercent === 25 || event_type === "progress_25") {
    updates.stats_watch_25 = (video.stats_watch_25 ?? 0) + 1;
  }
  if (progressPercent === 50 || event_type === "progress_50") {
    updates.stats_watch_50 = (video.stats_watch_50 ?? 0) + 1;
  }
  if (progressPercent === 75 || event_type === "progress_75") {
    updates.stats_watch_75 = (video.stats_watch_75 ?? 0) + 1;
  }
  if (progressPercent === 100 || event_type === "progress_100") {
    updates.stats_watch_100 = (video.stats_watch_100 ?? 0) + 1;
    updates.status = "viewed";
  }

  if (Object.keys(updates).length > 0) {
    await admin.from("videos").update(updates).eq("id", video_id);
  }

  return NextResponse.json({ ok: true });
}
