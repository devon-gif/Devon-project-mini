import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ error: "No rows parsed" }, { status: 400 });
  const inserts = rows.map(r => ({
    owner_user_id: user.id,
    name: r.name || r.full_name || "",
    title: r.title || r.job_title || "",
    company: r.company || r.company_name || "",
    email: r.email || "",
    linkedin_url: r.linkedin || r.linkedin_url || "",
  })).filter(r => r.name || r.email);
  const { error } = await supabase.from("people").upsert(inserts, { onConflict: "owner_user_id,email", ignoreDuplicates: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, imported: inserts.length });
}
