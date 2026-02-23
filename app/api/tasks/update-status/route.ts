import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { id, status } = body as { id?: string; status?: string };
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const allowedStatus = new Set(["todo", "in_progress", "done"]);
  if (!allowedStatus.has(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id,title,status,priority,due_date")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, task: updated });
}