import crypto from "crypto";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const { data: share } = await admin.from("shares").select("*").eq("token_hash", tokenHash).maybeSingle();

  if (!share) return notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) return notFound();

  const { data: accounts } = await admin
    .from("accounts")
    .select("id,name,domain,tier,status,score,created_at")
    .order("score", { ascending: false })
    .limit(25);

  const { data: events } = await admin
    .from("activity_events")
    .select("id,account_id,type,channel,summary,created_at, accounts(name)")
    .order("created_at", { ascending: false })
    .limit(15);

  const touches = (events ?? []).filter((e) => e.type === "touch_sent").length;
  const replies = (events ?? []).filter((e) => e.type === "reply").length;
  const meetings = (events ?? []).filter((e) => e.type === "meeting_booked").length;

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>BDR Proof of Work</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>Read-only share link • Live activity + accounts snapshot</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 20 }}>
        {[
          ["Accounts (shown)", String(accounts?.length ?? 0)],
          ["Touches (recent)", String(touches)],
          ["Replies (recent)", String(replies)],
          ["Meetings (recent)", String(meetings)],
        ].map(([label, value]) => (
          <div key={label} style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, border: "1px solid #333", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 14, fontWeight: 900 }}>Recent Activity</div>
        <div style={{ borderTop: "1px solid #333" }}>
          {(events ?? []).map((e) => (
            <div key={e.id} style={{ padding: 12, borderBottom: "1px solid #222" }}>
              <div style={{ fontWeight: 800 }}>
                {(Array.isArray(e.accounts) ? e.accounts[0]?.name : (e.accounts as { name?: string } | null)?.name) ?? "Account"} — {e.type}
                {e.channel ? ` (${e.channel})` : ""}
              </div>
              <div style={{ opacity: 0.8, marginTop: 4 }}>{e.summary ?? "—"}</div>
              <div style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
                {new Date(e.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {(!events || events.length === 0) && <div style={{ padding: 12, opacity: 0.7 }}>No activity yet.</div>}
        </div>
      </div>

      <div style={{ marginTop: 18, border: "1px solid #333", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 14, fontWeight: 900 }}>Top Accounts (by score)</div>
        <div style={{ overflowX: "auto", borderTop: "1px solid #333" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["Company", "Domain", "Tier", "Status", "Score"].map((h) => (
                  <th key={h} style={{ padding: 12, fontSize: 12, opacity: 0.75, borderBottom: "1px solid #333" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(accounts ?? []).map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: 12, fontWeight: 700 }}>{a.name}</td>
                  <td style={{ padding: 12, opacity: 0.85 }}>{a.domain ?? "—"}</td>
                  <td style={{ padding: 12 }}>{a.tier}</td>
                  <td style={{ padding: 12 }}>{a.status}</td>
                  <td style={{ padding: 12, fontWeight: 800 }}>{a.score ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}