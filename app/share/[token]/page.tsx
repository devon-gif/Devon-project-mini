import crypto from "crypto";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const { data: share } = await supabase
    .from("shares")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!share) return notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) return notFound();

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>BDR Proof of Work</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>Read-only share link • Mission Control</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 20 }}>
        {[
          ["Accounts touched", "—"],
          ["Contacts added", "—"],
          ["Touches sent", "—"],
          ["Replies", "—"],
          ["Meetings booked", "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}