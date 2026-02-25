import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStorageBucket } from "@/lib/supabase/storage";
import { getDb, insertVideo, getVideoById } from "@/lib/db";
import { safeSlug } from "@/lib/storage";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

function generatePublicToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    const storagePath = body.storagePath as string | undefined;
    const title = (body.title as string)?.trim();
    const recipient_name = (body.recipient_name as string) ?? "";
    const recipient_company = (body.recipient_company as string) ?? "";
    const recipient_email = (body.recipient_email as string) ?? "";
    const cta_type = body.cta_type === "forward" ? "forward" : "book";
    const cta_url = (body.cta_url as string) ?? "";
    const cta_label = (body.cta_label as string) ?? "";
    const prospect_id = (body.prospect_id as string) || null;

    if (USE_LOCAL && !storagePath && title) {
      try {
        getDb();
        const id = crypto.randomUUID();
        const slug = safeSlug(title, recipient_name || undefined);
        insertVideo({
          id,
          prospect_id: prospect_id || null,
          title,
          slug,
          recipient_name: recipient_name || null,
          recipient_email: recipient_email || null,
          recipient_company: recipient_company || null,
          cta_type,
          cta_url,
          cta_label: cta_label || null,
          video_path: null,
          gif_path: null,
          sent_at: null,
          status: "draft",
        });
        const row = getVideoById(id);
        if (!row) throw new Error("Insert failed");
        return NextResponse.json({
          ok: true,
          video: {
            id: row.id,
            title: row.title,
            video_path: row.video_path,
            status: row.status,
            created_at: row.created_at,
            public_token: row.slug,
          },
        });
      } catch (e) {
        console.error("POST /api/videos/create (local)", e);
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Create failed" },
          { status: 500 }
        );
      }
    }

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const recipient_email_for_db = (body.recipient_email as string)?.trim() || null;

    const admin = createAdminClient();
    let public_token = generatePublicToken();
    for (let i = 0; i < 5; i++) {
      const insertPayload: Record<string, unknown> = {
        owner_user_id: data.user.id,
        title,
        video_path: storagePath ?? "",
        gif_path: null,
        landing_slug: null,
        status: "draft",
        recipient_name,
        recipient_company,
        recipient_email: recipient_email_for_db,
        cta_type,
        cta_url,
        cta_label: (body.cta_label as string) ?? "Book 15 min",
        public_token,
        stats_views: 0,
        stats_clicks: 0,
      };
      const { data: inserted, error } = await admin
        .from("videos")
        .insert(insertPayload)
        .select("id, title, video_path, status, created_at, public_token")
        .single();
      if (error) {
        if (error.code === "23505") {
          public_token = generatePublicToken();
          continue;
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        video: {
          id: inserted.id,
          title: inserted.title,
          video_path: inserted.video_path,
          status: inserted.status,
          created_at: inserted.created_at,
          public_token: inserted.public_token,
        },
      });
    }
    return NextResponse.json({ error: "Could not generate unique token" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  if (!file || !title?.trim()) {
    return NextResponse.json({ error: "file and title are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  await ensureStorageBucket(admin, "videos", { public: false });
  const ext = file.name.split(".").pop() || "mp4";
  const path = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await admin.storage.from("videos").upload(path, file, { upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const public_token = generatePublicToken();
  const { data: inserted, error } = await admin
    .from("videos")
    .insert({
      owner_user_id: data.user.id,
      title: title.trim(),
      video_path: path,
      status: "draft",
      gif_path: null,
      landing_slug: null,
      recipient_name: null,
      recipient_company: null,
      recipient_email: null,
      cta_type: "book",
      cta_url: "",
      public_token,
      stats_views: 0,
      stats_clicks: 0,
    })
    .select("id, title, video_path, status, created_at, public_token")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    ok: true,
    video: {
      id: inserted.id,
      title: inserted.title,
      video_path: inserted.video_path,
      status: inserted.status,
      created_at: inserted.created_at,
      public_token: inserted.public_token,
    },
  });
}
