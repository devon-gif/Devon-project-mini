import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const UPLOADS = path.join(ROOT, "public", "uploads");
const VIDEOS_DIR = path.join(UPLOADS, "videos");
const GIFS_DIR = path.join(UPLOADS, "gifs");

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function ensureUploadDirs(): void {
  ensureDir(VIDEOS_DIR);
  ensureDir(GIFS_DIR);
}

/**
 * Safe URL slug from title + recipient (e.g. "Acme — John" -> "acme-john-a1b2").
 */
export function safeSlug(title: string, recipientName?: string): string {
  const base = [title, recipientName].filter(Boolean).join(" ");
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = crypto.randomUUID().slice(0, 6);
  return slug ? `${slug}-${suffix}` : suffix;
}

export function getVideoDir(): string {
  ensureDir(VIDEOS_DIR);
  return VIDEOS_DIR;
}

export function getGifDir(): string {
  ensureDir(GIFS_DIR);
  return GIFS_DIR;
}

/** Path on disk for video file (e.g. public/uploads/videos/{id}.mp4). */
export function videoFilePath(videoId: string, ext: string): string {
  return path.join(getVideoDir(), `${videoId}.${ext}`);
}

/** Public URL path for video (e.g. /uploads/videos/{id}.mp4). */
export function videoPublicPath(videoId: string, ext: string): string {
  return `/uploads/videos/${videoId}.${ext}`;
}

/** Path on disk for GIF. */
export function gifFilePath(videoId: string): string {
  return path.join(getGifDir(), `${videoId}.gif`);
}

/** Public URL path for GIF. */
export function gifPublicPath(videoId: string): string {
  return `/uploads/gifs/${videoId}.gif`;
}
