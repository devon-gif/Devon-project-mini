import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_TYPES = [
  "landing_view",
  "gif_click",
  "video_play",
  "progress_25",
  "progress_50",
  "progress_75",
  "progress_100",
  "cta_click",
  "forward_click",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

const MAP_TO_STORED: Record<string, string> = {
  landing_view: "page_view",
  video_play: "video_play",
  gif_click: "gif_click",
  progress_25: "watch_progress",
  progress_50: "watch_progress",
  progress_75: "watch_progress",
  progress_100: "watch_progress",
  cta_click: "cta_click",
  forward_click: "forward_click",
};

/**
 * POST /api/public/events — track landing page events (no CRM login).
 * Body: { videoId?: string, token?: string, type: EventType, meta?: { session_id?: string, ... } }
 * Stores event with timestamp + ip hash + user agent. Updates video stats (views, clicks, watch %).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const videoId = body.videoId as string | undefined;
  const token = body.token as string | undefined;
  const type = (body.type ?? body.event_type) as string | undefined;
  const meta = (body.meta ?? {}) as { session_id?: string; progress?: number };
  const session_id = meta.session_id ?? body.session_id ?? "";

  if (!type || !EVENT_TYPES.includes(type as EventType)) {
    return NextResponse.json(
      { error: "type is required and must be one of: " + EVENT_TYPES.join(", ") },
      { status: 400 }
    );
  }
  if (!videoId && !token) {
    return NextResponse.json({ error: "videoId or token is required" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let resolvedVideoId: string;
  let video: { id: string; stats_views?: number; stats_clicks?: number; stats_watch_25?: number; stats_watch_50?: number; stats_watch_75?: number; stats_watch_100?: number; status?: string };

  if (videoId) {
    const { data: v, error } = await admin.from("videos").select("id, stats_views, stats_clicks, stats_watch_25, stats_watch_50, stats_watch_75, stats_watch_100, status").eq("id", videoId).maybeSingle();
    if (error || !v) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    resolvedVideoId = v.id;
    video = v;
  } else {
    const { data: v, error } = await admin
      .from("videos")
      .select("id, stats_views, stats_clicks, stats_watch_25, stats_watch_50, stats_watch_75, stats_watch_100, status")
      .eq("public_token", token)
      .maybeSingle();
    if (error || !v) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    resolvedVideoId = v.id;
    video = v;
  }

  const progressPercent =
    type === "progress_25" ? 25 : type === "progress_50" ? 50 : type === "progress_75" ? 75 : type === "progress_100" ? 100 : meta.progress;

  // Dedupe: one page_view per (video_id, session_id)
  if ((type === "landing_view" || type === "page_view") && session_id) {
    const { data: existing } = await admin
      .from("video_events")
      .select("id")
      .eq("video_id", resolvedVideoId)
      .eq("session_id", session_id)
      .eq("event_type", "page_view")
      .limit(1)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, duplicate: true });
  }

  // Dedupe: one progress per (video_id, session_id, progress_percent)
  if (type.startsWith("progress_") && session_id && progressPercent != null) {
    const { data: existing } = await admin
      .from("video_events")
      .select("id")
      .eq("video_id", resolvedVideoId)
      .eq("session_id", session_id)
      .eq("event_type", "watch_progress")
      .eq("progress_percent", progressPercent)
      .limit(1)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, duplicate: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";
  const ipHash = ip ? Buffer.from(ip).toString("base64").slice(0, 44) : "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const storedType = MAP_TO_STORED[type] ?? type;

  const insertPayload: Record<string, unknown> = {
    video_id: resolvedVideoId,
    session_id: session_id,
    event_type: storedType,
    meta: { ...meta, ip_hash: ipHash || undefined, user_agent: userAgent || undefined },
  };
  if (progressPercent != null && (type.startsWith("progress_") || type === "watch_progress")) {
    insertPayload.progress_percent = typeof progressPercent === "number" ? Math.min(100, Math.max(0, Math.round(progressPercent))) : progressPercent;
  }

  const { error: insertErr } = await admin.from("video_events").insert(insertPayload);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const updates: Record<string, number | string> = {};
  if (type === "landing_view") {
    updates.stats_views = (video.stats_views ?? 0) + 1;
    updates.status = (video.status === "ready" || video.status === "sent") ? "viewed" : (video.status ?? "draft");
  }
  if (type === "gif_click") {
    // optional: count gif clicks in meta or a separate stat
  }
  if (type === "cta_click") {
    updates.stats_clicks = (video.stats_clicks ?? 0) + 1;
    updates.status = "clicked";
  }
  if (type === "forward_click") {
    updates.stats_clicks = (video.stats_clicks ?? 0) + 1;
  }
  if (progressPercent === 25) {
    updates.stats_watch_25 = (video.stats_watch_25 ?? 0) + 1;
  }
  if (progressPercent === 50) {
    updates.stats_watch_50 = (video.stats_watch_50 ?? 0) + 1;
  }
  if (progressPercent === 75) {
    updates.stats_watch_75 = (video.stats_watch_75 ?? 0) + 1;
  }
  if (progressPercent === 100) {
    updates.stats_watch_100 = (video.stats_watch_100 ?? 0) + 1;
    updates.status = "viewed";
  }

  if (Object.keys(updates).length > 0) {
    await admin.from("videos").update(updates).eq("id", resolvedVideoId);
  }

  return NextResponse.json({ ok: true });
}
