import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStorageBucket } from "@/lib/supabase/storage";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/**
 * POST /api/videos/[id]/cover — upload cover image (PNG/JPG) for video.
 * Replaces GIF for email attachment. Auth required.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: videoId } = await params;

  const admin = createAdminClient();
  const { data: video, error: fetchError } = await admin
    .from("videos")
    .select("id, owner_user_id")
    .eq("id", videoId)
    .single();

  if (fetchError || !video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.owner_user_id !== data.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return NextResponse.json({ error: "file is required" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, or WebP images allowed" },
      { status: 400 }
    );
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `${videoId}.${ext}`;

  await ensureStorageBucket(admin, "covers", { public: true });

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("covers")
    .upload(storagePath, buf, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { error: updateErr } = await admin
    .from("videos")
    .update({ cover_path: storagePath, status: "ready" })
    .eq("id", videoId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, cover_path: storagePath });
}
