import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb, getVideoById, updateVideoGifAndStatus } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage-adapter";
import { gifFilePath, ensureUploadDirs } from "@/lib/storage";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

const GIF_DURATION_SEC = 4;
const GIF_WIDTH = 480;

/** Resolve ffmpeg binary: ffmpeg-static (bundled). */
function getFfmpegPath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("ffmpeg-static") as { default?: string } | string;
    const p = typeof m === "string" ? m : m?.default;
    if (p && typeof p === "string" && fs.existsSync(p)) return p;
  } catch {
    // ignore
  }
  return "ffmpeg";
}

/** Resolve ffprobe binary for Render (ffprobe-static when available). */
function getFfprobePath(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("ffprobe-static");
    const p = m?.path ?? m?.default?.path;
    if (p && typeof p === "string" && fs.existsSync(p)) return p;
  } catch {
    // ignore
  }
  return null;
}

function failResponse(details: string, status = 500) {
  return NextResponse.json(
    { ok: false, code: "GIF_GEN_FAILED", error: details, details },
    { status }
  );
}

function successResponse(gif_path: string | null, skipped = false, message?: string) {
  return NextResponse.json({
    ok: true,
    gif_path,
    ...(skipped && { skipped: true, message: message ?? "GIF generation failed. Landing page is ready; use video as poster." }),
  });
}

const PIPELINE_TIMEOUT_MS = 120_000;

/** Run GIF + thumbnail generation using fluent-ffmpeg. Returns { gifPath, thumbPath } or throws. */
async function generateGifAndThumbnail(
  inputPath: string,
  videoId: string,
  opts: { ffmpegPath: string; ffprobePath: string | null; logLabel: string }
): Promise<{ gifPath: string; thumbPath: string }> {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Video file not found at ${inputPath}`);
  }
  const stat = fs.statSync(inputPath);
  if (stat.size === 0) {
    throw new Error("Video file is empty");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpeg = require("fluent-ffmpeg") as typeof import("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(opts.ffmpegPath);
  if (opts.ffprobePath) ffmpeg.setFfprobePath(opts.ffprobePath);

  const tmpDir = os.tmpdir();
  const gifOut = path.join(tmpDir, `gif-${videoId}-${Date.now()}.gif`);
  const thumbOut = path.join(tmpDir, `thumb-${videoId}-${Date.now()}.jpg`);

  // 1) ffprobe: log codec + duration (optional — skip if ffprobe missing or fails)
  if (opts.ffprobePath) {
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err: Error | null, metadata: unknown) => {
          if (err) {
            console.error(`[generate-gif] ${opts.logLabel} ffprobe error (continuing):`, err.message);
            resolve();
            return;
          }
          const format = (metadata as any)?.format;
          const videoStream = (metadata as any)?.streams?.find((s: any) => s.codec_type === "video");
          const codec = videoStream?.codec_name ?? "unknown";
          const duration = format?.duration ?? 0;
          console.error(`[generate-gif] ${opts.logLabel} ffprobe videoId=${videoId} codec=${codec} duration=${duration}s`);
          resolve();
        });
      });
    } catch {
      // ignore and continue without metadata
    }
  }

  const withTimeout = <T>(p: Promise<T>, ms: number, label: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
      ),
    ]);

  // 2) Thumbnail: single frame at 0.5s, width 480 (-ss before -i for fast seek)
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      let stderr = "";
      const cmd = ffmpeg(inputPath)
        .inputOptions(["-ss", "0.5"])
        .outputOptions(["-vframes", "1", "-vf", `scale=${GIF_WIDTH}:-1`])
        .output(thumbOut)
        .on("error", (err: Error) => {
          console.error(`[generate-gif] ${opts.logLabel} thumbnail error:`, err.message);
          reject(err);
        })
        .on("stderr", (line: string) => {
          stderr += line + "\n";
        })
        .on("end", () => resolve());
      cmd.run();
    }),
    PIPELINE_TIMEOUT_MS,
    "Thumbnail"
  );

  // 3) GIF: first 3–5 seconds, width 480, palette
  const filter = `fps=12,scale=${GIF_WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      let stderr = "";
      const cmd = ffmpeg(inputPath)
        .outputOptions([
          "-t",
          String(GIF_DURATION_SEC),
          "-vf",
          filter,
          "-loop",
          "0",
        ])
        .output(gifOut)
        .on("error", (err: Error) => {
          console.error(`[generate-gif] ${opts.logLabel} gif error:`, err.message, "stderr (last 2000):", stderr.slice(-2000));
          reject(err);
        })
        .on("stderr", (line: string) => {
          stderr += line + "\n";
        })
        .on("end", () => resolve());
      cmd.run();
    }),
    PIPELINE_TIMEOUT_MS,
    "GIF"
  );

  if (!fs.existsSync(gifOut)) throw new Error("GIF file was not created");
  if (!fs.existsSync(thumbOut)) throw new Error("Thumbnail file was not created");

  return { gifPath: gifOut, thumbPath: thumbOut };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let videoId: string | undefined;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    videoId = id;

  if (USE_LOCAL) {
    try {
      const storage = getStorageAdapter();
      getDb();
      const video = getVideoById(videoId);
      if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
      const videoPath = video.video_path;
      if (!videoPath) return NextResponse.json({ error: "No video file uploaded" }, { status: 400 });

      if (!storage.canWriteFiles()) {
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", videoId);
        return successResponse(null, true, "GIF generation not available in this environment. Video is still shareable.");
      }

      const diskVideoPath = storage.getVideoDiskPath(videoId, videoPath);
      if (!diskVideoPath) {
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", videoId);
        return successResponse(null, true, "Video file not readable here. Video is still shareable.");
      }

      if (!fs.existsSync(diskVideoPath)) {
        return NextResponse.json({ error: "Video file not found on disk" }, { status: 404 });
      }

      const ffmpegPath = getFfmpegPath();
      const ffprobePath = getFfprobePath();
      const { gifPath: tmpGif, thumbPath: tmpThumb } = await generateGifAndThumbnail(diskVideoPath, videoId, {
        ffmpegPath,
        ffprobePath,
        logLabel: "local",
      });
      try {
        ensureUploadDirs();
        const outGifPath = gifFilePath(videoId);
        fs.copyFileSync(tmpGif, outGifPath);
        const gifPublicPath = `/uploads/gifs/${videoId}.gif`;
        updateVideoGifAndStatus(videoId, gifPublicPath);
        return successResponse(gifPublicPath);
      } finally {
        for (const p of [tmpGif, tmpThumb]) {
          try {
            if (p && fs.existsSync(p)) fs.unlinkSync(p);
          } catch (e) {
            console.error("[generate-gif] local cleanup tmp:", e);
          }
        }
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[generate-gif] local error videoId=", videoId, "inputPath=", "local disk", "stack=", err.stack);
      console.error("[generate-gif] local error message:", err.message);
      try {
        getDb();
        getDb().prepare("UPDATE videos SET status = ? WHERE id = ?").run("ready", videoId);
      } catch (_) {}
      return successResponse(null, true, "GIF generation failed. Landing page is ready.");
    }
  }

  // Production: Supabase — download to /tmp/<id>.mp4, then generate GIF + thumbnail, upload both
  const admin = createAdminClient();
  const { data: video, error: fetchError } = await admin
    .from("videos")
    .select("id, video_path, owner_user_id")
    .eq("id", videoId)
    .single();
  if (fetchError || !video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.owner_user_id !== data.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const storagePath = video.video_path as string | null;
  if (!storagePath?.trim()) {
    await admin.from("videos").update({ status: "ready" }).eq("id", videoId);
    return successResponse(null, true, "No video file. Landing page is ready.");
  }

  const tmpDir = os.tmpdir();
  const ext = path.extname(storagePath) || ".mp4";
  const tmpInput = path.join(tmpDir, `${videoId}${ext}`);
  let tmpGif = "";
  let tmpThumb = "";

  const cleanup = async () => {
    for (const p of [tmpInput, tmpGif, tmpThumb]) {
      if (!p) continue;
      try {
        await fs.promises.unlink(p);
      } catch {
        // ignore
      }
    }
  };

  try {
    const inputUrl = `supabase://videos/${storagePath}`;

    const { data: blob, error: downloadError } = await admin.storage.from("videos").download(storagePath);
    if (downloadError || !blob) {
      console.error("[generate-gif] videoId=", videoId, "inputUrl=", inputUrl, "downloadError=", downloadError);
      await admin.from("videos").update({ status: "ready" }).eq("id", videoId);
      return successResponse(null, true, "Could not download video. Landing page is ready.");
    }

    await fs.promises.writeFile(tmpInput, Buffer.from(await blob.arrayBuffer()));

    const ffmpegPath = getFfmpegPath();
    const ffprobePath = getFfprobePath();
    const { gifPath, thumbPath } = await generateGifAndThumbnail(tmpInput, videoId, {
      ffmpegPath,
      ffprobePath,
      logLabel: "production",
    });
    tmpGif = gifPath;
    tmpThumb = thumbPath;

    const gifBuffer = await fs.promises.readFile(gifPath);
    const thumbBuffer = await fs.promises.readFile(thumbPath);
    const gifStoragePath = `${videoId}.gif`;
    const thumbStoragePath = `${videoId}.jpg`;

    const { error: gifUploadError } = await admin.storage.from("gifs").upload(gifStoragePath, gifBuffer, {
      contentType: "image/gif",
      upsert: true,
    });
    if (gifUploadError) {
      console.error("[generate-gif] videoId=", videoId, "gif upload error:", gifUploadError);
      await admin.from("videos").update({ status: "ready" }).eq("id", videoId);
      return successResponse(null, true, "GIF upload failed. Landing page is ready.");
    }

    await admin.storage.from("gifs").upload(thumbStoragePath, thumbBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

    const { error: updateErr } = await admin
      .from("videos")
      .update({ status: "ready", gif_path: gifStoragePath })
      .eq("id", videoId);
    if (updateErr) {
      console.error("[generate-gif] update video row error:", updateErr);
      return successResponse(null, true, "GIF saved but status update failed.");
    }

    return successResponse(gifStoragePath);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const inputUrl = `supabase://videos/${storagePath ?? ""}`;
    const ffmpegPath = getFfmpegPath();
    const approxCmd = `ffmpeg -y -i /tmp/<id>.mp4 -t ${GIF_DURATION_SEC} -vf fps=12,scale=${GIF_WIDTH}:-1:flags=lanczos,... <out>.gif`;
    console.error("[generate-gif] GIF_GEN_FAILED videoId=", videoId, "inputUrl=", inputUrl);
    console.error("[generate-gif] ffmpegPath=", ffmpegPath);
    console.error("[generate-gif] ffmpeg cmd (approx)=", approxCmd);
    console.error("[generate-gif] error message=", err.message);
    console.error("[generate-gif] stack=", err.stack);
    try {
      await admin.from("videos").update({ status: "ready" }).eq("id", videoId);
    } catch (_) {}
    return failResponse(err.message || "GIF generation failed", 500);
  } finally {
    await cleanup();
  }
  } catch (outer) {
    const err = outer instanceof Error ? outer : new Error(String(outer));
    console.error("[generate-gif] unhandled error videoId=", videoId, err.message, err.stack);
    return NextResponse.json(
      { ok: false, code: "GIF_GEN_FAILED", error: err.message, details: err.message },
      { status: 500 }
    );
  }
}
