import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStorageBucket } from "@/lib/supabase/storage";

/**
 * POST /api/people/[id]/avatar — upload a profile image for a person.
 * Accepts multipart form with "file" (image). Uploads to Supabase avatars bucket,
 * updates people.avatar_url, returns { avatar_url }.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: personId } = await params;
  const admin = createAdminClient();
  const { data: person, error: fetchErr } = await admin
    .from("people")
    .select("id")
    .eq("id", personId)
    .single();
  if (fetchErr || !person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  const formData = await _request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Image file required" }, { status: 400 });
  }

  await ensureStorageBucket(admin, "avatars", { public: true });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/gi, "") || "jpg";
  const storagePath = `people/${personId}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(storagePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[avatar] upload error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("avatars").getPublicUrl(storagePath);
  const avatarUrl = urlData?.publicUrl ?? "";

  const { error: updateError } = await admin
    .from("people")
    .update({ avatar_url: avatarUrl })
    .eq("id", personId);

  if (updateError) {
    console.error("[avatar] update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}
