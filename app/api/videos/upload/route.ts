import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStorageBucket } from "@/lib/supabase/storage";
import { getDb, getVideoById, updateVideoPath } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage-adapter";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const videoId = formData.get("videoId") as string | null;

  if (USE_LOCAL && videoId && file) {
    try {
      const storage = getStorageAdapter();
      if (!storage.canWriteFiles()) {
        return NextResponse.json(
          { error: "File storage not available on this environment (e.g. Vercel). Use Supabase or S3." },
          { status: 503 }
        );
      }
      getDb();
      const row = getVideoById(videoId);
      if (!row) return NextResponse.json({ error: "Video not found" }, { status: 404 });
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/gi, "") || "mp4";
      const buf = Buffer.from(await file.arrayBuffer());
      const publicPath = await storage.writeVideo(videoId, ext, buf);
      updateVideoPath(videoId, publicPath);
      return NextResponse.json({ storagePath: publicPath, videoUrl: publicPath });
    } catch (e) {
      console.error("POST /api/videos/upload (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Upload failed" },
        { status: 500 }
      );
    }
  }

  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const admin = createAdminClient();
  await ensureStorageBucket(admin, "videos", { public: false });

  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/gi, "") || "mp4";

  let storagePath: string;
  if (videoId) {
    storagePath = `${videoId}.${ext}`;
    const { error } = await admin.storage.from("videos").upload(storagePath, file, { upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { error: updateErr } = await admin
      .from("videos")
      .update({ video_path: storagePath })
      .eq("id", videoId)
      .eq("owner_user_id", data.user.id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  } else {
    storagePath = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage.from("videos").upload(storagePath, file, { upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const usePublic = process.env.NEXT_PUBLIC_SUPABASE_VIDEOS_BUCKET_PUBLIC === "true";
  let videoUrl = "";
  if (usePublic) {
    const { data: urlData } = admin.storage.from("videos").getPublicUrl(storagePath);
    videoUrl = urlData?.publicUrl ?? "";
  } else {
    const { data: signed } = await admin.storage.from("videos").createSignedUrl(storagePath, 3600);
    videoUrl = signed?.signedUrl ?? "";
  }

  return NextResponse.json({ storagePath, videoUrl });
}
