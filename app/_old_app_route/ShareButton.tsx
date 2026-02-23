"use client";

import { useState } from "react";

export default function ShareButton() {
  const [msg, setMsg] = useState("");

  async function createShare() {
    setMsg("Creating link…");
    const res = await fetch("/api/share/create", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(`Error: ${json?.error || "failed"}`);
      return;
    }
    const url = json?.url;
    try {
      await navigator.clipboard.writeText(url);
      setMsg("✅ Copied share link");
    } catch {
      setMsg(url);
    }
    setTimeout(() => setMsg(""), 1500);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={createShare}
        style={{
          padding: "10px 12px",
          borderRadius: 14,
          border: "1px solid #333",
          background: "transparent",
          cursor: "pointer",
          fontWeight: 900,
        }}
      >
        Share read-only
      </button>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{msg}</div>
    </div>
  );
}