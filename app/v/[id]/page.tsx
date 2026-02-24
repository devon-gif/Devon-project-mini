import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function VideoLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: video, error } = await supabase
    .from("videos")
    .select("id, title, video_path, gif_path, status")
    .eq("id", id)
    .single();

  if (error || !video) return notFound();
  if (video.status !== "ready") return notFound();

  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(video.video_path || "");

  const videoUrl = urlData?.publicUrl || video.video_path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{video.title || "Video"}</h1>

        <div className="rounded-xl overflow-hidden bg-black shadow-lg">
          <video
            controls
            className="w-full aspect-video"
            src={videoUrl}
            poster={video.gif_path || undefined}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="flex justify-center">
          <Link
            href="https://cal.com/alexkim/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-white font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            Book a call
          </Link>
        </div>
      </div>
    </div>
  );
}
