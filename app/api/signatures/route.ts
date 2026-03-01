import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("signatures").select("*").eq("user_id", user.id).order("created_at");
  return NextResponse.json({ signatures: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, content, is_default } = body;
  if (!name || !content) return NextResponse.json({ error: "name and content required" }, { status: 400 });
  if (is_default) await supabase.from("signatures").update({ is_default: false }).eq("user_id", user.id);
  const { data, error } = await supabase.from("signatures").insert({ user_id: user.id, name, content, is_default: !!is_default }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ signature: data });
}
