import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("templates").select("*").eq("user_id", user.id).order("created_at");
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, category, subject, body: tplBody } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const { data, error } = await supabase.from("templates").insert({ user_id: user.id, name, category: category ?? "Outreach", subject: subject ?? "", body: tplBody ?? "" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data });
}
