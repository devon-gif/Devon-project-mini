import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const SAMPLE_PATH = path.join(process.cwd(), "public", "sample.mp4");

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

/**
 * GET /api/videos/self-test-gif — admin-only self-test of GIF pipeline using /public/sample.mp4.
 * Query or header: x-admin-secret or Authorization Bearer must match ADMIN_SECRET or SEED_TOKEN.
 */
export async function GET(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET || process.env.SEED_TOKEN;
  const headerSecret = request.headers.get("x-admin-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!adminSecret || headerSecret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!fs.existsSync(SAMPLE_PATH)) {
    return NextResponse.json(
      {
        error: "sample.mp4 not found",
        details: "Place a tiny MP4 file at public/sample.mp4 to run the self-test.",
      },
      { status: 404 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpeg = require("fluent-ffmpeg") as typeof import("fluent-ffmpeg");
  const ffmpegPath = getFfmpegPath();
  const ffprobePath = getFfprobePath();
  ffmpeg.setFfmpegPath(ffmpegPath);
  if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);

  const tmpDir = os.tmpdir();
  const gifOut = path.join(tmpDir, `self-test-${Date.now()}.gif`);
  const thumbOut = path.join(tmpDir, `self-test-${Date.now()}.jpg`);

  const cleanup = () => {
    for (const p of [gifOut, thumbOut]) {
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {
        // ignore
      }
    }
  };

  try {
    // 1) ffprobe
    const metadata = await new Promise<{ format?: { duration?: number }; streams?: { codec_type: string; codec_name?: string }[] }>((resolve, reject) => {
      ffmpeg.ffprobe(SAMPLE_PATH, (err, data) => {
        if (err) reject(err);
        else resolve(data as { format?: { duration?: number }; streams?: { codec_type: string; codec_name?: string }[] });
      });
    });
    const codec = metadata?.streams?.find((s) => s.codec_type === "video")?.codec_name ?? "unknown";
    const duration = metadata?.format?.duration ?? 0;

    // 2) Thumbnail
    await new Promise<void>((resolve, reject) => {
      ffmpeg(SAMPLE_PATH)
        .seekInput(0.5)
        .outputOptions(["-vframes", "1", "-vf", "scale=480:-1"])
        .output(thumbOut)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });

    // 3) GIF (4s, 480px)
    const filter = "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
    await new Promise<void>((resolve, reject) => {
      ffmpeg(SAMPLE_PATH)
        .outputOptions(["-t", "4", "-vf", filter, "-loop", "0"])
        .output(gifOut)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });

    if (!fs.existsSync(gifOut) || !fs.existsSync(thumbOut)) {
      cleanup();
      return NextResponse.json({ ok: false, error: "Output files not created" }, { status: 500 });
    }

    // Copy to public so we can return URLs (optional: or return base64)
    const publicDir = path.join(process.cwd(), "public", "uploads", "gifs");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const publicGif = path.join(publicDir, "self-test.gif");
    const publicThumb = path.join(publicDir, "self-test.jpg");
    fs.copyFileSync(gifOut, publicGif);
    fs.copyFileSync(thumbOut, publicThumb);
    cleanup();

    return NextResponse.json({
      ok: true,
      codec,
      duration_seconds: duration,
      gif_url: "/uploads/gifs/self-test.gif",
      thumbnail_url: "/uploads/gifs/self-test.jpg",
    });
  } catch (e) {
    cleanup();
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[self-test-gif] error:", err.message, err.stack);
    return NextResponse.json(
      { ok: false, error: err.message, code: "GIF_GEN_FAILED", details: err.message },
      { status: 500 }
    );
  }
}
