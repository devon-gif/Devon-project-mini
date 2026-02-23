import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // require logged-in user
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    title,
    account_id,
    type = "custom",
    status = "todo",
    priority = "warm",
    due_date = null,
    note = null,
  } = body as any;

  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const allowedStatus = new Set(["todo", "in_progress", "done"]);
  const allowedPriority = new Set(["hot", "warm", "cold"]);
  if (!allowedStatus.has(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  if (!allowedPriority.has(priority)) return NextResponse.json({ error: "Invalid priority" }, { status: 400 });

  const admin = createAdminClient();
  const { data: inserted, error } = await admin
    .from("tasks")
    .insert({
      title: String(title).trim(),
      account_id: account_id || null,
      type,
      status,
      priority,
      due_date,
      note,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .select("id,title,account_id,type,status,priority,due_date,created_at,completed_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, task: inserted });
}