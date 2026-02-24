import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb, getVideoById, updateVideoGifAndStatus } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage-adapter";
import { gifFilePath, ensureUploadDirs } from "@/lib/storage";
import { spawn } from "child_process";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (USE_LOCAL) {
    try {
      const storage = getStorageAdapter();
      getDb();
      const video = getVideoById(id);
      if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
      const videoPath = video.video_path;
      if (!videoPath) return NextResponse.json({ error: "No video file uploaded" }, { status: 400 });

      if (!storage.canWriteFiles()) {
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", id);
        return NextResponse.json({
          ok: true,
          gif_path: null,
          skipped: true,
          message: "GIF generation not available on this environment (e.g. Vercel). Video is still shareable.",
        });
      }

      const diskVideoPath = storage.getVideoDiskPath(id, videoPath);
      if (!diskVideoPath) {
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", id);
        return NextResponse.json({
          ok: true,
          gif_path: null,
          skipped: true,
          message: "Video file not readable here. Video is still shareable.",
        });
      }

      const { existsSync } = await import("fs");
      if (!existsSync(diskVideoPath)) {
        return NextResponse.json({ error: "Video file not found on disk" }, { status: 404 });
      }
      ensureUploadDirs();
      const outGifPath = gifFilePath(id);
      const ffmpegPath = await import("ffmpeg-static").then((m) => (m.default as string) || "ffmpeg");
      await new Promise<void>((resolve, reject) => {
        const args = [
          "-y",
          "-i", diskVideoPath,
          "-t", "4",
          "-vf", "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
          "-loop", "0",
          outGifPath,
        ];
        const proc = spawn(ffmpegPath, args, { stdio: "pipe" });
        let stderr = "";
        proc.stderr?.on("data", (c) => { stderr += c.toString(); });
        proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`))));
      });
      const gifPublicPath = `/uploads/gifs/${id}.gif`;
      updateVideoGifAndStatus(id, gifPublicPath);
      return NextResponse.json({ ok: true, gif_path: gifPublicPath });
    } catch (e) {
      console.error("POST /api/videos/[id]/generate-gif (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "GIF generation failed" },
        { status: 500 }
      );
    }
  }

  const admin = createAdminClient();
  const { data: video, error: fetchError } = await admin
    .from("videos")
    .select("id, owner_user_id")
    .eq("id", id)
    .single();
  if (fetchError || !video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.owner_user_id !== data.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let gif_path: string | null = null;
  try {
    const { execSync } = await import("child_process");
    execSync("ffmpeg -version", { stdio: "ignore" });
  } catch {
    // Graceful fallback
  }

  const { error: updateError } = await admin
    .from("videos")
    .update({ status: "ready", ...(gif_path != null && { gif_path }) })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, gif_path });
}
