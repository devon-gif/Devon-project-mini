/**
 * Storage abstraction for video/GIF files.
 * Default: local FS (public/uploads). Swap implementation for Supabase/S3 later.
 */

import * as path from "path";
import * as fs from "fs";

export type StorageAdapter = {
  /** Whether persistent file writes are available (e.g. false on Vercel serverless). */
  canWriteFiles: () => boolean;
  /** Write video buffer to storage; return public URL path. */
  writeVideo: (videoId: string, ext: string, buffer: Buffer) => Promise<string>;
  /** Resolve disk path for reading video (for GIF generation). Returns null if not readable. */
  getVideoDiskPath: (videoId: string, publicPath: string) => string | null;
  /** Write GIF buffer to storage; return public URL path. */
  writeGif: (videoId: string, buffer: Buffer) => Promise<string>;
};

function isVercelOrReadOnly(): boolean {
  return process.env.VERCEL === "1";
}

const localAdapter: StorageAdapter = {
  canWriteFiles() {
    return !isVercelOrReadOnly();
  },

  async writeVideo(videoId: string, ext: string, buffer: Buffer): Promise<string> {
    const { ensureUploadDirs, videoFilePath, videoPublicPath } = await import("@/lib/storage");
    ensureUploadDirs();
    const diskPath = videoFilePath(videoId, ext);
    fs.writeFileSync(diskPath, buffer);
    return videoPublicPath(videoId, ext);
  },

  getVideoDiskPath(_videoId: string, publicPath: string): string | null {
    if (isVercelOrReadOnly()) return null;
    const normalized = publicPath.replace(/^\//, "");
    return path.join(process.cwd(), "public", normalized);
  },

  async writeGif(videoId: string, buffer: Buffer): Promise<string> {
    const { ensureUploadDirs, gifFilePath, gifPublicPath } = await import("@/lib/storage");
    ensureUploadDirs();
    const diskPath = gifFilePath(videoId);
    fs.writeFileSync(diskPath, buffer);
    return gifPublicPath(videoId);
  },
};

let adapter: StorageAdapter = localAdapter;

export function getStorageAdapter(): StorageAdapter {
  return adapter;
}

export function setStorageAdapter(a: StorageAdapter): void {
  adapter = a;
}
