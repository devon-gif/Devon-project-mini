import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...rows.map(r => keys.map(k => escape(r[k])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = new URL(req.url).searchParams.get("type") ?? "people";
  let rows: Record<string, unknown>[] = [];
  if (type === "people") {
    const { data } = await supabase.from("people").select("id,name,title,company,email,linkedin_url").eq("owner_user_id", user.id);
    rows = data ?? [];
  } else if (type === "accounts") {
    const { data } = await supabase.from("accounts").select("id,name,domain,industry,size,status").eq("owner_user_id", user.id);
    rows = data ?? [];
  } else if (type === "tasks") {
    const { data } = await supabase.from("tasks").select("id,title,status,due_date,created_at").eq("owner_user_id", user.id);
    rows = data ?? [];
  } else if (type === "videos") {
    const { data } = await supabase.from("videos").select("id,title,status,recipient_name,recipient_company,created_at,stats_views,stats_clicks").eq("owner_user_id", user.id);
    rows = data ?? [];
  }
  const csv = toCSV(rows);
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${type}.csv"` } });
}
