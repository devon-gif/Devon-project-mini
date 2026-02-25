import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateBucketOptions = {
  public?: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
};

/**
 * Ensure a Storage bucket exists; create it if missing (e.g. "Bucket not found").
 * Uses service-role client so it can create buckets. Idempotent — safe to call every time.
 */
export async function ensureStorageBucket(
  admin: SupabaseClient,
  bucketId: string,
  createOptions?: CreateBucketOptions
): Promise<void> {
  const { error: getError } = await admin.storage.getBucket(bucketId);
  if (!getError) return; // bucket exists
  // Bucket not found or other error — try to create
  const { error: createError } = await admin.storage.createBucket(bucketId, {
    public: createOptions?.public ?? false,
    ...(createOptions?.fileSizeLimit != null && { fileSizeLimit: createOptions.fileSizeLimit }),
    ...(createOptions?.allowedMimeTypes != null && { allowedMimeTypes: createOptions.allowedMimeTypes }),
  });
  if (createError) {
    if (createError.message?.toLowerCase().includes("already exists")) return;
    throw new Error(`Storage bucket "${bucketId}" could not be created: ${createError.message}`);
  }
}
