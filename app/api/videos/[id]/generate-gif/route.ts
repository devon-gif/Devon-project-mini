import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb, getVideoById, updateVideoGifAndStatus } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage-adapter";
import { gifFilePath, ensureUploadDirs } from "@/lib/storage";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

/** Resolve ffmpeg binary: prefer ffmpeg-static (npm), fallback to "ffmpeg" in PATH. */
async function getFfmpegPath(): Promise<string> {
  try {
    const m = await import("ffmpeg-static");
    const p = (m.default as string) || "";
    if (p && fs.existsSync(p)) return p;
  } catch {
    // ignore
  }
  return "ffmpeg";
}

/** Run ffmpeg; capture stderr for server logs only. Rejects on non-zero exit. */
function runFfmpeg(
  ffmpegPath: string,
  args: string[],
  opts: { logLabel: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const proc = spawn(ffmpegPath, args, { stdio: ["pipe", "pipe", "pipe"] });
    proc.stderr?.on("data", (c) => {
      stderr += c.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      // Log stderr server-side only; do not send to client
      console.error(`[generate-gif] ${opts.logLabel} ffmpeg exit ${code}. stderr (last 2000 chars):`, stderr.slice(-2000));
      reject(new Error(`ffmpeg exited ${code}`));
    });
    proc.on("error", (err) => {
      console.error(`[generate-gif] ${opts.logLabel} spawn error:`, err);
      reject(err);
    });
  });
}

/** Mark video ready and return success with optional gif_path; on GIF failure still return ok with gif_path null. */
function successResponse(gif_path: string | null, skipped = false, message?: string) {
  return NextResponse.json({
    ok: true,
    gif_path,
    ...(skipped && { skipped: true, message: message ?? "GIF generation failed. Landing page is ready; use video as poster." }),
  });
}

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
        return successResponse(null, true, "GIF generation not available in this environment. Video is still shareable.");
      }

      const diskVideoPath = storage.getVideoDiskPath(id, videoPath);
      if (!diskVideoPath) {
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", id);
        return successResponse(null, true, "Video file not readable here. Video is still shareable.");
      }

      const { existsSync } = await import("fs");
      if (!existsSync(diskVideoPath)) {
        return NextResponse.json({ error: "Video file not found on disk" }, { status: 404 });
      }

      const ffmpegPath = await getFfmpegPath();
      const tmpDir = os.tmpdir();
      const tmpGif = path.join(tmpDir, `gif-${id}-${Date.now()}.gif`);

      try {
        await runFfmpeg(ffmpegPath, [
          "-y",
          "-i", diskVideoPath,
          "-t", "4",
          "-vf", "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
          "-loop", "0",
          tmpGif,
        ], { logLabel: "local" });

        ensureUploadDirs();
        const outGifPath = gifFilePath(id);
        fs.copyFileSync(tmpGif, outGifPath);
        const gifPublicPath = `/uploads/gifs/${id}.gif`;
        updateVideoGifAndStatus(id, gifPublicPath);
        return successResponse(gifPublicPath);
      } finally {
        try {
          if (fs.existsSync(tmpGif)) fs.unlinkSync(tmpGif);
        } catch (e) {
          console.error("[generate-gif] local cleanup tmp:", e);
        }
      }
    } catch (e) {
      console.error("[generate-gif] local error:", e);
      try {
        getDb();
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", id);
      } catch (_) {}
      return successResponse(null, true, "GIF generation failed. Landing page is ready.");
    }
  }

  // Production: Supabase storage — download video to tmp, generate GIF with ffmpeg-static, upload to gifs bucket
  const admin = createAdminClient();
  const { data: video, error: fetchError } = await admin
    .from("videos")
    .select("id, video_path, owner_user_id")
    .eq("id", id)
    .single();
  if (fetchError || !video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.owner_user_id !== data.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const storagePath = video.video_path as string | null;
  if (!storagePath?.trim()) {
    const { error: updateErr } = await admin
      .from("videos")
      .update({ status: "ready" })
      .eq("id", id);
    if (updateErr) console.error("[generate-gif] update status error:", updateErr);
    return successResponse(null, true, "No video file. Landing page is ready.");
  }

  const tmpDir = os.tmpdir();
  const tmpInput = path.join(tmpDir, `video-${id}-${Date.now()}.mp4`);
  const tmpGif = path.join(tmpDir, `gif-${id}-${Date.now()}.gif`);
  const cleanup = async () => {
    for (const p of [tmpInput, tmpGif]) {
      try {
        await fs.promises.unlink(p);
      } catch {
        // ignore
      }
    }
  };

  try {
    const { data: blob, error: downloadError } = await admin.storage.from("videos").download(storagePath);
    if (downloadError || !blob) {
      console.error("[generate-gif] Supabase download error:", downloadError);
      const { error: updateErr } = await admin.from("videos").update({ status: "ready" }).eq("id", id);
      if (updateErr) console.error("[generate-gif] update status error:", updateErr);
      return successResponse(null, true, "Could not download video. Landing page is ready.");
    }

    const buf = Buffer.from(await blob.arrayBuffer());
    await fs.promises.writeFile(tmpInput, buf);

    const ffmpegPath = await getFfmpegPath();
    await runFfmpeg(ffmpegPath, [
      "-y",
      "-i", tmpInput,
      "-t", "4",
      "-vf", "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      "-loop", "0",
      tmpGif,
    ], { logLabel: "production" });

    if (!fs.existsSync(tmpGif)) {
      throw new Error("GIF file was not created");
    }

    const gifBuffer = await fs.promises.readFile(tmpGif);
    const gifStoragePath = `${id}.gif`;
    const { error: uploadError } = await admin.storage.from("gifs").upload(gifStoragePath, gifBuffer, {
      contentType: "image/gif",
      upsert: true,
    });

    if (uploadError) {
      console.error("[generate-gif] Supabase gifs upload error:", uploadError);
      const { error: updateErr } = await admin.from("videos").update({ status: "ready" }).eq("id", id);
      if (updateErr) console.error("[generate-gif] update status error:", updateErr);
      return successResponse(null, true, "GIF upload failed. Landing page is ready.");
    }

    const { error: updateErr } = await admin
      .from("videos")
      .update({ status: "ready", gif_path: gifStoragePath })
      .eq("id", id);
    if (updateErr) {
      console.error("[generate-gif] update video row error:", updateErr);
      return successResponse(null, true, "GIF saved but status update failed.");
    }

    return successResponse(gifStoragePath);
  } catch (e) {
    console.error("[generate-gif] production error:", e);
    try {
      const { error: updateErr } = await admin.from("videos").update({ status: "ready" }).eq("id", id);
      if (updateErr) console.error("[generate-gif] update status error:", updateErr);
    } catch (_) {}
    return successResponse(null, true, "GIF generation failed. Landing page is ready; use video as poster.");
  } finally {
    await cleanup();
  }
}
