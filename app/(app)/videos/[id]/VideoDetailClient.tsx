"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassCard } from "@/figma/components/GlassCard";
import { VideoStatusChip } from "@/figma/components/VideoStatusChip";
import { CopyButton } from "@/figma/components/CopyButton";
import { EmailSnippetPanel } from "@/figma/components/EmailSnippetPanel";
import {
  ArrowLeft,
  Play,
  Eye,
  MousePointerClick,
  CalendarCheck,
  TrendingUp,
  Clock,
  Send,
  Mail,
  Globe,
  ExternalLink,
  Undo2,
  StickyNote,
  Bot,
  Sparkles,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const EVENT_LABELS: Record<string, { label: string; icon: typeof Send; color: string; bg: string }> = {
  email_delivered: { label: "Email Delivered", icon: Send, color: "#6B7280", bg: "#F3F4F6" },
  email_compose_opened: { label: "Gmail / Mail compose opened", icon: Mail, color: "#2563EB", bg: "#DBEAFE" },
  email_snippet_copied: { label: "Email snippet copied", icon: Mail, color: "#6B7280", bg: "#F3F4F6" },
  email_marked_sent: { label: "Marked as sent", icon: Send, color: "#10B981", bg: "#D1FAE5" },
  forward_submitted: { label: "Forward submitted", icon: Send, color: "#8B5CF6", bg: "#EDE9FE" },
  email_opened: { label: "Email Opened", icon: Mail, color: "#2563EB", bg: "#DBEAFE" },
  gif_click: { label: "GIF Clicked", icon: MousePointerClick, color: "#F59E0B", bg: "#FEF3C7" },
  page_view: { label: "Landing Page Viewed", icon: Globe, color: "#8B5CF6", bg: "#EDE9FE" },
  play: { label: "Video Played", icon: Play, color: "#2563EB", bg: "#DBEAFE" },
  progress_25: { label: "Video Watched 25%", icon: Play, color: "#EF4444", bg: "#FEE2E2" },
  progress_50: { label: "Video Watched 50%", icon: Play, color: "#F59E0B", bg: "#FEF3C7" },
  progress_75: { label: "Video Watched 75%", icon: Play, color: "#2563EB", bg: "#DBEAFE" },
  progress_100: { label: "Video Watched 100%", icon: Play, color: "#10B981", bg: "#D1FAE5" },
  watch_progress_25: { label: "Video Watched 25%", icon: Play, color: "#EF4444", bg: "#FEE2E2" },
  watch_progress_50: { label: "Video Watched 50%", icon: Play, color: "#F59E0B", bg: "#FEF3C7" },
  watch_progress_75: { label: "Video Watched 75%", icon: Play, color: "#2563EB", bg: "#DBEAFE" },
  watch_progress_100: { label: "Video Watched 100%", icon: Play, color: "#10B981", bg: "#D1FAE5" },
  cta_click: { label: "CTA Clicked", icon: ExternalLink, color: "#EC4899", bg: "#FCE7F3" },
  booking: { label: "Meeting Booked", icon: CalendarCheck, color: "#10B981", bg: "#D1FAE5" },
};

function formatEventType(ev: { event_type: string; progress_percent?: number }): string {
  if (ev.event_type === "watch_progress" && ev.progress_percent != null) {
    return `watch_progress_${ev.progress_percent}`;
  }
  if (ev.event_type?.startsWith("progress_")) return ev.event_type;
  return ev.event_type;
}

type VideoRow = {
  id: string;
  title: string;
  status: string;
  created_at?: string;
  sent_at?: string | null;
  public_token?: string | null;
  recipient_name?: string | null;
  recipient_company?: string | null;
  stats_views?: number | null;
  stats_clicks?: number | null;
  stats_bookings?: number | null;
  stats_watch_25?: number | null;
  stats_watch_50?: number | null;
  stats_watch_75?: number | null;
  stats_watch_100?: number | null;
  stats_avg_watch_percent?: number | null;
};

type EventRow = { id: string; created_at: string; event_type: string; progress_percent?: number; meta?: Record<string, unknown> };

type ForwardRow = { id: string; recipient_name: string; recipient_email: string; note: string | null; created_at: string };

export function VideoDetailClient({
  video: rawVideo,
  events,
  forwards = [],
}: {
  video: Record<string, unknown>;
  events: EventRow[];
  forwards?: ForwardRow[];
}) {
  const router = useRouter();
  const video = rawVideo as VideoRow;
  const [markedSent, setMarkedSent] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);

  const isSent = markedSent || ["sent", "viewed", "clicked", "booked"].includes(video.status);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const landingUrl = video.public_token ? `${base}/share/${video.public_token}` : "";

  const handleMarkSent = async () => {
    const res = await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "sent" }),
    });
    if (res.ok) {
      setMarkedSent(true);
      toast.success("Marked as sent");
    } else {
      toast.error("Failed to update");
    }
  };

  const timelineEvents = events.map((ev) => ({
    id: ev.id,
    type: formatEventType(ev),
    timestamp: new Date(ev.created_at).toLocaleString(),
    meta: ev.meta,
  })) as Array<{ id: string; type: string; timestamp: string; meta?: Record<string, unknown> }>;

  const views = video.stats_views ?? 0;
  const clicks = video.stats_clicks ?? 0;
  const bookings = video.stats_bookings ?? 0;
  const avgWatch = video.stats_avg_watch_percent ?? 0;
  const w25 = (video.stats_watch_25 ?? 0) > 0;
  const w50 = (video.stats_watch_50 ?? 0) > 0;
  const w75 = (video.stats_watch_75 ?? 0) > 0;
  const w100 = (video.stats_watch_100 ?? 0) > 0;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/videos")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-gray-900">{video.title || "Untitled"}</h1>
              <VideoStatusChip
                status={(isSent && video.status === "ready" ? "sent" : video.status) as "draft" | "processing" | "ready" | "sent" | "viewed" | "clicked" | "booked"}
                size="md"
              />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {video.recipient_name ?? ""} at {video.recipient_company ?? ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton text={landingUrl} variant="default" label="Copy Link" toastMessage="Landing link copied" />
          <button
            onClick={() => setShowSnippet(!showSnippet)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Snippet
          </button>
          <button
            onClick={() => landingUrl && window.open(landingUrl, "_blank")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      {showSnippet && (
        <EmailSnippetPanel
          recipientName={video.recipient_name ?? ""}
          company={video.recipient_company ?? ""}
          subjectLine={`Quick idea for ${video.recipient_company ?? ""}`}
          landingPageSlug={video.public_token ?? undefined}
          landingUrl={landingUrl}
          recipientEmail={(video as { recipient_email?: string }).recipient_email}
          videoId={video.id}
          ctaLabel="Book 12 minutes"
          onMarkedSent={() => { setMarkedSent(true); }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Views", value: views, icon: Eye, color: "#8B5CF6" },
              { label: "Clicks", value: clicks, icon: MousePointerClick, color: "#F59E0B" },
              { label: "Bookings", value: bookings, icon: CalendarCheck, color: "#10B981" },
              { label: "Avg Watch %", value: `${avgWatch}%`, icon: TrendingUp, color: "#2563EB" },
            ].map((kpi) => (
              <GlassCard key={kpi.label} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${kpi.color}12` }}
                  >
                    <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                <p className="text-xl text-gray-900 font-semibold">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-5">
            <h3 className="text-gray-800 mb-3">Video Watch Progress</h3>
            <div className="space-y-3">
              {[
                { pct: 25, reached: w25 },
                { pct: 50, reached: w50 },
                { pct: 75, reached: w75 },
                { pct: 100, reached: w100 },
              ].map(({ pct, reached }) => (
                <div key={pct} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">{pct}%</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: reached ? "100%" : "0%",
                        backgroundColor:
                          pct <= 25 ? "#EF4444" : pct <= 50 ? "#F59E0B" : pct <= 75 ? "#2563EB" : "#10B981",
                      }}
                    />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      reached
                        ? pct === 100
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {reached ? "Reached" : "Not reached"}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-gray-800 mb-4">Activity Timeline</h3>
            {timelineEvents.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {timelineEvents.map((event, i) => {
                  const config = EVENT_LABELS[event.type];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center w-8">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                          style={{ backgroundColor: config.bg }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                        </div>
                        {i < timelineEvents.length - 1 && (
                          <div className="w-0.5 flex-1 min-h-[24px] bg-gray-100" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700 font-medium">
                            {event.type === "forward_submitted" && event.meta?.recipient_name != null
                              ? `Forward submitted: ${String(event.meta.recipient_name)} (${String(event.meta.recipient_email ?? "")})`
                              : config.label}
                          </p>
                          <span className="text-[11px] text-gray-400">{event.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-5">
          {forwards.length > 0 && (
            <GlassCard className="p-4">
              <h3 className="text-gray-800 font-medium mb-3">Forwarded to …</h3>
              <div className="space-y-3">
                {forwards.map((f) => (
                  <div key={f.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                    <p className="text-sm font-medium text-gray-800">{f.recipient_name}</p>
                    <p className="text-xs text-gray-500">{f.recipient_email}</p>
                    {f.note && <p className="text-xs text-gray-600 mt-1">{f.note}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">{new Date(f.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-4 space-y-2.5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Actions</p>
            <CopyButton
              text={landingUrl}
              variant="default"
              label="Copy landing link"
              toastMessage="Landing link copied"
              className="w-full justify-center"
            />
            {!isSent ? (
              <button
                onClick={handleMarkSent}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Mark as Sent
              </button>
            ) : (
              <button
                onClick={() => setMarkedSent(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo Sent
              </button>
            )}
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <StickyNote className="h-3.5 w-3.5" />
              Add note
            </button>
            {showNoteInput && (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                  placeholder="Add a note about this video..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2563EB] resize-none h-20"
                />
                <button
                  onClick={() => {
                    toast.success("Note saved");
                    setShowNoteInput(false);
                  }}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Save note
                </button>
              </div>
            )}
          </GlassCard>

          {forwards.length > 0 && (
            <GlassCard className="p-4">
              <h3 className="text-gray-800 font-medium mb-3">Forwarded to …</h3>
              <div className="space-y-3">
                {forwards.map((f) => (
                  <div key={f.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                    <p className="text-sm font-medium text-gray-800">{f.recipient_name}</p>
                    <p className="text-xs text-gray-500">{f.recipient_email}</p>
                    {f.note && <p className="text-xs text-gray-600 mt-1">{f.note}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">{new Date(f.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-amber-100 text-xs text-gray-600 font-semibold"
              >
                {(video.recipient_name ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">{video.recipient_name ?? ""}</p>
                <p className="text-xs text-gray-500">{video.recipient_company ?? ""}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
