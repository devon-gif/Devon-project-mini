import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: people, error } = await supabase
    .from("people").select("id, name, title, company, email, linkedin_url")
    .eq("owner_user_id", data.user.id).order("name");

  if (error) return NextResponse.json({ people: [] });
  return NextResponse.json({ people: people || [] });
}
