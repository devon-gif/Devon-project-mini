import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { spawn } from "child_process";
import * as fs from "fs";

const version = process.env.npm_package_version ?? "0.1.0";
const commitSha =
  process.env.RENDER_GIT_COMMIT ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.COMMIT_SHA ??
  "unknown";
const nodeVersion = process.version;

type CheckResult = { ok: boolean; message?: string };

async function checkSupabase(): Promise<CheckResult> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return { ok: false, message: "Supabase not configured" };
    }
    const admin = createAdminClient();
    const { error } = await admin.from("videos").select("id").limit(1).maybeSingle();
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

async function checkStorage(): Promise<CheckResult> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.from("videos").list("", { limit: 1 });
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

function checkFfmpeg(): Promise<CheckResult> {
  return new Promise((resolve) => {
    let bin = "ffmpeg";
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const m = require("ffmpeg-static") as { default?: string } | string;
      const p = typeof m === "string" ? m : m?.default;
      if (p && typeof p === "string" && fs.existsSync(p)) bin = p;
    } catch {
      // use PATH
    }
    const proc = spawn(bin, ["-version"], { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (c) => {
      stderr += c.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true });
        return;
      }
      resolve({ ok: false, message: `exit ${code}` });
    });
    proc.on("error", (err) => {
      resolve({ ok: false, message: err.message });
    });
  });
}

function checkFfprobe(): Promise<CheckResult> {
  return new Promise((resolve) => {
    let bin = "ffprobe";
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const m = require("ffprobe-static");
      const p = m?.path ?? m?.default?.path;
      if (p && typeof p === "string" && fs.existsSync(p)) bin = p;
    } catch {
      // use PATH
    }
    const proc = spawn(bin, ["-version"], { stdio: ["ignore", "pipe", "pipe"] });
    proc.on("close", (code) => {
      if (code === 0) resolve({ ok: true });
      else resolve({ ok: false, message: `exit ${code}` });
    });
    proc.on("error", (err) => {
      resolve({ ok: false, message: err.message });
    });
  });
}

/**
 * GET /api/health — no auth. Returns 200 with ok + version + checks (DB, storage, ffmpeg).
 * Does NOT return env var values or keys.
 */
export async function GET() {
  const checks: Record<string, CheckResult> = {};
  let allOk = true;

  const supabase = await checkSupabase();
  checks.supabase = supabase;
  if (!supabase.ok) {
    allOk = false;
    console.error("[health] Supabase check failed:", supabase.message);
  }

  const storage = await checkStorage();
  checks.storage = storage;
  if (!storage.ok) {
    allOk = false;
    console.error("[health] Storage check failed:", storage.message);
  }

  const ffmpeg = await checkFfmpeg();
  checks.ffmpeg = ffmpeg;
  if (!ffmpeg.ok) {
    allOk = false;
    console.error("[health] FFmpeg check failed:", ffmpeg.message);
  }

  const ffprobe = await checkFfprobe();
  checks.ffprobe = ffprobe;
  if (!ffprobe.ok) {
    allOk = false;
    console.error("[health] FFprobe check failed:", ffprobe.message);
  }

  if (allOk) {
    return NextResponse.json(
      {
        ok: true,
        version,
        commitSha,
        nodeVersion,
        checks,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      version,
      commitSha,
      nodeVersion,
      checks,
      error: "One or more health checks failed",
    },
    { status: 503 }
  );
}
