// app/share/[token]/page.tsx
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Params = { token: string };

function supabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function SharePage({ params }: { params: Params }) {
  const token = params.token;

  const supabase = supabaseAnon();

  const { data: video, error } = await supabase
    .from("videos")
    .select("id,title,recipient_name,recipient_company,cta_label,cta_url,storage_video_path,storage_thumb_path,share_token")
    .eq("share_token", token)
    .maybeSingle();

  if (error || !video) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 42, marginBottom: 8 }}>Video not found</h1>
          <p style={{ opacity: 0.7 }}>This link may be invalid or the video may have been removed.</p>
        </div>
      </div>
    );
  }

  // If you store full public URLs instead of paths, you can use them directly.
  // If you store storage paths, you’ll generate a signed URL (see section C2).
  const videoSrc = video.storage_video_path || "";
  const poster = video.storage_thumb_path || undefined;

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        Hey {video.recipient_name ?? "there"} — quick idea for {video.recipient_company ?? ""}
      </h1>

      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
        <video
          controls
          playsInline
          style={{ width: "100%", display: "block", background: "#000" }}
          src={videoSrc}
          poster={poster}
        />
      </div>

      {video.cta_url ? (
        <div style={{ marginTop: 16 }}>
          <a
            href={video.cta_url}
            style={{
              display: "inline-flex",
              padding: "12px 16px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {video.cta_label ?? "Book time"}
          </a>
        </div>
      ) : null}
    </div>
  );
}