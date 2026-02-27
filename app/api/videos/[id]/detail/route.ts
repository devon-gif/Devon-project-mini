import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data: video, error: videoErr } = await supabase
    .from("videos").select("*").eq("id", id).eq("owner_user_id", data.user.id).single();
  if (videoErr || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createAdminClient();
  const { data: events } = await admin
    .from("video_events").select("id, created_at, event_type, progress_percent, meta")
    .eq("video_id", id).order("created_at", { ascending: false }).limit(100);

  const { data: forwards } = await admin
    .from("shares").select("id, recipient_name, recipient_email, note, created_at")
    .eq("video_id", id).order("created_at", { ascending: false });

  return NextResponse.json({
    video,
    events: (events ?? []).map((e) => ({
      id: e.id,
      created_at: e.created_at,
      event_type: e.event_type,
      progress_percent: e.progress_percent ?? null,
      meta: e.meta,
    })),
    forwards: forwards ?? [],
  });
}
