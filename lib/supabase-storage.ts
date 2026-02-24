import type { SupabaseClient } from "@supabase/supabase-js";

const SIGNED_URL_EXPIRES_SEC = 3600; // 1 hour

/**
 * Returns a URL suitable for playback on the share page.
 * - If bucket is public (env NEXT_PUBLIC_SUPABASE_VIDEOS_BUCKET_PUBLIC=true): public URL.
 * - Otherwise: signed URL (works with private bucket).
 */
export async function getVideoPlaybackUrl(
  admin: SupabaseClient,
  storagePath: string,
  bucket = "videos"
): Promise<string> {
  if (!storagePath?.trim()) return "";
  const usePublic =
    process.env.NEXT_PUBLIC_SUPABASE_VIDEOS_BUCKET_PUBLIC === "true";
  if (usePublic) {
    const { data } = admin.storage.from(bucket).getPublicUrl(storagePath);
    return data?.publicUrl ?? "";
  }
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_SEC);
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

/**
 * Returns a public or signed URL for a GIF (gifs bucket is typically public).
 */
export async function getGifPlaybackUrl(
  admin: SupabaseClient,
  storagePath: string,
  bucket = "gifs"
): Promise<string> {
  if (!storagePath?.trim()) return "";
  const { data } = admin.storage.from(bucket).getPublicUrl(storagePath);
  return data?.publicUrl ?? "";
}
