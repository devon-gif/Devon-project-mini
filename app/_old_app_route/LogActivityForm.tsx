"use client";

import { useMemo, useState } from "react";

type Account = {
  id: string;
  name: string;
};

export default function LogActivityForm({ accounts }: { accounts: Account[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [type, setType] = useState<"touch_sent" | "reply" | "meeting_booked" | "note">("touch_sent");
  const [channel, setChannel] = useState<"email" | "linkedin" | "call">("email");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<string>("");

  const selectedName = useMemo(
    () => accounts.find((a) => a.id === accountId)?.name ?? "",
    [accounts, accountId]
  );

  async function submit() {
    setStatus("Logging…");
    const res = await fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: accountId,
        type,
        channel: type === "note" ? null : channel,
        summary: summary || `${type} — ${selectedName}`,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(`Error: ${json?.error || "failed"}`);
      return;
    }

    setStatus("✅ Logged! Refreshing…");
    setSummary("");
    // simplest refresh for now
    window.location.reload();
  }

  return (
    <div style={{ border: "1px solid #333", borderRadius: 12, padding: 14, marginTop: 16 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>Log Activity</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 10 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 12, opacity: 0.9 }}>
          Account
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={selStyle}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 12, opacity: 0.9 }}>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as any)} style={selStyle}>
            <option value="touch_sent">Touch sent</option>
            <option value="reply">Reply</option>
            <option value="meeting_booked">Meeting booked</option>
            <option value="note">Note</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 12, opacity: 0.9 }}>
          Channel
          <select value={channel} onChange={(e) => setChannel(e.target.value as any)} style={selStyle} disabled={type === "note"}>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="call">Call</option>
          </select>
        </label>
      </div>

      <label style={{ display: "grid", gap: 6, marginTop: 10, fontSize: 12, opacity: 0.9 }}>
        Summary (optional)
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Ex: Sent intro email to VP Eng — asked about hiring plans"
          style={inputStyle}
        />
      </label>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
        <button onClick={submit} style={btnStyle}>
          Save
        </button>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{status}</div>
      </div>
    </div>
  );
}

const selStyle: React.CSSProperties = {
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "transparent",
  color: "inherit",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "transparent",
  color: "inherit",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  cursor: "pointer",
  background: "transparent",
  fontWeight: 800,
};