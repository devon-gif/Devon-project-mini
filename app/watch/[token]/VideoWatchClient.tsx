"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, CalendarCheck, ArrowRight } from "lucide-react";

const SESSION_COOKIE = "tv_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getOrCreateSessionId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  if (match) return match[1];
  const id = crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  return id;
}

function postEvent(
  token: string,
  sessionId: string,
  eventType: string,
  progressPercent?: number
) {
  const body: Record<string, unknown> = { token, session_id: sessionId, event_type: eventType };
  if (progressPercent != null) body.progress_percent = progressPercent;
  fetch("/api/public/video-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

type Props = {
  token: string;
  title: string;
  recipientName: string;
  recipientCompany: string;
  videoUrl: string;
  gifUrl: string | null;
  ctaType: "book" | "forward";
  ctaUrl: string;
};

export function VideoWatchClient({
  token,
  title,
  recipientName,
  recipientCompany,
  videoUrl,
  gifUrl,
  ctaType,
  ctaUrl,
}: Props) {
  const sessionIdRef = useRef<string>("");
  const pageViewSentRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    if (!sessionIdRef.current || pageViewSentRef.current) return;
    pageViewSentRef.current = true;
    postEvent(token, sessionIdRef.current, "page_view");
  }, [token]);

  const bookingSentRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || bookingSentRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("booked") !== "1") return;
    bookingSentRef.current = true;
    const sid = getOrCreateSessionId();
    fetch("/api/public/video-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, session_id: sid }),
    }).catch(() => {});
  }, [token]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    const sid = sessionIdRef.current;
    if (!video || !sid || video.duration <= 0) return;
    const percent = Math.floor((video.currentTime / video.duration) * 100);
    for (const p of [25, 50, 75, 100]) {
      if (percent >= p && !milestonesRef.current.has(p)) {
        milestonesRef.current.add(p);
        postEvent(token, sid, "watch_progress", p);
      }
    }
  }, [token]);

  const handleCtaClick = () => {
    if (sessionIdRef.current) {
      postEvent(token, sessionIdRef.current, "cta_click");
    }
    if (ctaUrl) window.open(ctaUrl, "_blank", "noopener,noreferrer");
  };

  const handleGifClick = () => {
    if (sessionIdRef.current) {
      postEvent(token, sessionIdRef.current, "gif_click");
    }
  };

  const firstName = recipientName.trim() ? recipientName.split(" ")[0] : "there";
  const company = recipientCompany || "your company";
  const ctaLabel = ctaType === "book" ? "Book a time" : "Forward to the right person";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FFD600]">
                <span className="text-[8px] font-bold text-gray-900">T</span>
              </div>
              <span className="text-xs text-gray-400">Twill</span>
            </div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Hey {firstName} — quick idea for {company}
            </h2>
            <p className="mt-1 text-sm text-gray-400">A personalized message from Alex at Twill</p>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="overflow-hidden rounded-xl bg-black">
                <video
                  ref={videoRef}
                  controls
                  className="aspect-video w-full"
                  src={videoUrl}
                  poster={gifUrl ?? undefined}
                  title={title}
                  onTimeUpdate={onTimeUpdate}
                  onClick={handleGifClick}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-[#2563EB]" />
                  <span className="text-sm font-medium text-gray-700">{ctaLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  {ctaType === "book" ? (
                    <>
                      <CalendarCheck className="h-4 w-4" />
                      Book 12 minutes
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-3.5 w-3.5" />
                      Forward to the right person
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-300">
                Personalized video sent by Alex Kim at Twill.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!sessionIdRef.current) return;
                  fetch("/api/public/video-booking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, session_id: sessionIdRef.current }),
                  }).then(() => {
                    (window as unknown as { __bookingDone?: boolean }).__bookingDone = true;
                  });
                }}
                className="mt-2 w-full text-center text-[10px] text-gray-400 underline hover:text-gray-600"
              >
                I booked a meeting (demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
