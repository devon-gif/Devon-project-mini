import { createClient } from "@supabase/supabase-js";

type Params = { token: string };

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function SharePage({ params }: { params: Params }) {
  const token = params.token;
  const admin = supabaseAdmin();

  // Fetch by public_token first, then share_token as fallback
  let { data: video, error } = await admin
    .from("videos")
    .select("id, title, recipient_name, recipient_company, video_path, storage_video_path, cover_path, storage_cover_path, public_token, share_token")
    .eq("public_token", token)
    .maybeSingle();

  if (!video) {
    const r = await admin
      .from("videos")
      .select("id, title, recipient_name, recipient_company, video_path, storage_video_path, cover_path, storage_cover_path, public_token, share_token")
      .eq("share_token", token)
      .maybeSingle();
    video = r.data ?? null;
    error = r.error ?? null;
  }

  if (error || !video) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "ui-sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 800 }}>Video not found</div>
          <div style={{ opacity: 0.7, marginTop: 8 }}>This link may be invalid or the video may have been removed.</div>
        </div>
      </div>
    );
  }

  const videoPath = (video.storage_video_path || video.video_path || "") as string;
  const coverPath = ((video as any).storage_cover_path || (video as any).cover_path || "") as string;

  const { data: signedVideo } = await admin.storage.from("videos").createSignedUrl(videoPath, 60 * 60);
  const videoUrl = signedVideo?.signedUrl || "";

  let posterUrl: string | null = null;
  if (coverPath) {
    const { data: signedCover } = await admin.storage.from("covers").createSignedUrl(coverPath, 60 * 60);
    posterUrl = signedCover?.signedUrl ?? null;
  }

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 24, fontFamily: "ui-sans-serif" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          Hey {video.recipient_name ?? "there"} — quick idea for {video.recipient_company ?? "your team"}
        </div>
        <div style={{ opacity: 0.7, marginTop: 6 }}>{video.title ?? "Personalized video"}</div>
      </div>

      <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
        <video
          controls
          playsInline
          style={{ width: "100%", height: "auto", display: "block", background: "#000" }}
          src={videoUrl}
          poster={posterUrl ?? undefined}
        />
      </div>
    </div>
  );
}
