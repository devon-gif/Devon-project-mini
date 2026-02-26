import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { VideoWatchClient } from "./VideoWatchClient";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: video, error } = await admin
    .from("videos")
    .select("id, title, video_path, cover_path, gif_path, status, recipient_name, recipient_company, cta_type, cta_url, public_token")
    .eq("public_token", token)
    .single();
  if (error || !video) return notFound();
  if (video.status === "draft" || video.status === "processing") return notFound();

  const { data: urlData } = admin.storage.from("videos").getPublicUrl(video.video_path || "");
  const videoUrl = urlData?.publicUrl ?? "";
  let posterUrl: string | null = null;
  const coverPath = (video.cover_path as string)?.trim();
  const gifPath = (video.gif_path as string)?.trim();
  if (coverPath) {
    const c = admin.storage.from("covers").getPublicUrl(coverPath);
    posterUrl = c.data?.publicUrl ?? null;
  } else if (gifPath) {
    const g = admin.storage.from("gifs").getPublicUrl(gifPath);
    posterUrl = g.data?.publicUrl ?? null;
  }

  return (
    <VideoWatchClient
      token={token}
      title={video.title ?? "Video"}
      recipientName={video.recipient_name ?? ""}
      recipientCompany={video.recipient_company ?? ""}
      videoUrl={videoUrl}
      gifUrl={posterUrl}
      ctaType={(video.cta_type as "book" | "forward") ?? "book"}
      ctaUrl={video.cta_url ?? ""}
    />
  );
}
