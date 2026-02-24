import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: video, error: fetchError } = await admin
    .from("videos")
    .select("id, stats_views")
    .eq("public_token", token)
    .single();
  if (fetchError || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { error: updateError } = await admin
    .from("videos")
    .update({ stats_views: (video.stats_views ?? 0) + 1 })
    .eq("id", video.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
