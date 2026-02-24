"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type VideoShareProps = {
  slug: string;
  recipientName: string | null;
  recipientCompany: string | null;
  videoPath: string;
  ctaUrl: string | null;
  ctaLabel: string | null;
};

const MILESTONES = [25, 50, 75, 100];
const VIEWER_ID_COOKIE = "viewer_id";
const VIEWER_ID_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getViewerId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${VIEWER_ID_COOKIE}=([^;]*)`));
  if (match) return decodeURIComponent(match[1]);
  const id = crypto.randomUUID();
  document.cookie = `${VIEWER_ID_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${VIEWER_ID_MAX_AGE}; SameSite=Lax`;
  return id;
}

function postEvent(slug: string, type: string, meta?: Record<string, unknown>, viewerId?: string) {
  const body: Record<string, unknown> = {
    share_token: slug,
    event_type: type,
    ...(viewerId && { session_id: viewerId }),
    ...(meta && { meta }),
  };
  fetch("/api/public/video-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export default function ShareVideoClient({
  slug,
  recipientName,
  recipientCompany,
  videoPath,
  ctaUrl,
  ctaLabel,
}: VideoShareProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sentView = useRef(false);
  const sentPlay = useRef(false);
  const sentMilestones = useRef<Set<number>>(new Set());
  const [viewerId, setViewerId] = useState("");
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardName, setForwardName] = useState("");
  const [forwardEmail, setForwardEmail] = useState("");
  const [forwardNote, setForwardNote] = useState("");
  const [forwardSubmitting, setForwardSubmitting] = useState(false);
  const [forwardSuccess, setForwardSuccess] = useState(false);

  useEffect(() => {
    setViewerId(getViewerId());
  }, []);

  useEffect(() => {
    if (sentView.current) return;
    sentView.current = true;
    postEvent(slug, "page_view", undefined, viewerId || undefined);
  }, [slug, viewerId]);

  const onPlay = useCallback(() => {
    if (sentPlay.current) return;
    sentPlay.current = true;
    postEvent(slug, "play", undefined, viewerId || undefined);
  }, [slug, viewerId]);

  const onTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || el.duration <= 0) return;
    const pct = (el.currentTime / el.duration) * 100;
    for (const m of MILESTONES) {
      if (pct >= m && !sentMilestones.current.has(m)) {
        sentMilestones.current.add(m);
        postEvent(slug, `progress_${m}`, undefined, viewerId || undefined);
      }
    }
  }, [slug, viewerId]);

  const onCtaClick = useCallback(() => {
    postEvent(slug, "cta_click", undefined, viewerId || undefined);
    if (ctaUrl) window.open(ctaUrl, "_blank");
  }, [slug, ctaUrl, viewerId]);

  const onForwardSubmit = useCallback(async () => {
    const name = forwardName.trim();
    const email = forwardEmail.trim();
    if (!name || !email) return;
    setForwardSubmitting(true);
    try {
      const res = await fetch("/api/public/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          recipient_name: name,
          recipient_email: email,
          note: forwardNote.trim() || undefined,
          viewer_id: viewerId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setForwardSuccess(true);
      setForwardOpen(false);
      setForwardName("");
      setForwardEmail("");
      setForwardNote("");
    } catch {
      setForwardSubmitting(false);
      return;
    }
    setForwardSubmitting(false);
    setForwardSuccess(true);
  }, [slug, viewerId, forwardName, forwardEmail, forwardNote]);

  useEffect(() => {
    if (!forwardSuccess) return;
    const t = setTimeout(() => setForwardSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [forwardSuccess]);

  const recipient = recipientName?.trim() || "there";
  const company = recipientCompany?.trim() || "your company";

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        Hey {recipient} — quick idea for {company}
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>Watch the short video below.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
        <div style={{ background: "#111", borderRadius: 12, overflow: "hidden" }}>
          <video
            ref={videoRef}
            src={videoPath}
            controls
            playsInline
            onPlay={onPlay}
            onTimeUpdate={onTimeUpdate}
            style={{ width: "100%", display: "block" }}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={() => setForwardOpen(true)}
            style={{
              width: "100%",
              marginBottom: 16,
              padding: "12px 16px",
              background: "transparent",
              color: "#888",
              border: "1px solid #444",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Forward to the right person
          </button>
          {(ctaUrl || ctaLabel) && (
            <div style={{ border: "1px solid #333", borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                {ctaLabel || "Book a call"}
              </div>
              <button
                type="button"
                onClick={onCtaClick}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#FFD600",
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {ctaLabel || "Book a 12-min call"}
              </button>
            </div>
          )}
        </div>
      </div>

      {forwardOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => !forwardSubmitting && setForwardOpen(false)}
        >
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              border: "1px solid #333",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>Forward to the right person</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#888" }}>Name</label>
              <input
                type="text"
                value={forwardName}
                onChange={(e) => setForwardName(e.target.value)}
                placeholder="Recipient name"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#222",
                  border: "1px solid #444",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#888" }}>Email</label>
              <input
                type="email"
                value={forwardEmail}
                onChange={(e) => setForwardEmail(e.target.value)}
                placeholder="Recipient email"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#222",
                  border: "1px solid #444",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#888" }}>Note (optional)</label>
              <textarea
                value={forwardNote}
                onChange={(e) => setForwardNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#222",
                  border: "1px solid #444",
                  borderRadius: 8,
                  color: "#fff",
                  resize: "vertical",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => !forwardSubmitting && setForwardOpen(false)}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  color: "#888",
                  border: "1px solid #444",
                  borderRadius: 8,
                  cursor: forwardSubmitting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onForwardSubmit}
                disabled={forwardSubmitting || !forwardName.trim() || !forwardEmail.trim()}
                style={{
                  padding: "10px 16px",
                  background: "#FFD600",
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: forwardSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {forwardSubmitting ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {forwardSuccess && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 20px",
            background: "#0f7d40",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 500,
            zIndex: 50,
          }}
        >
          Forward submitted. Thanks!
        </div>
      )}
    </div>
  );
}
