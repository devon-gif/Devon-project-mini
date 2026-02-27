import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const type = (body.type ?? body.event_type) as string | undefined;
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  const admin = createAdminClient();
  await admin.from("video_events").insert({ video_id: id, session_id: "crm", event_type: type, meta: body.meta ?? null });
  return NextResponse.json({ ok: true });
}
