import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AccountInput = {
  name: string;
  domain?: string | null;
  tier?: string | null;   // "P0" | "P1" | "P2"
  status?: string | null; // "Prospecting" | "Active" | "Nurturing"
  score?: number | null;
};

export async function POST(request: Request) {
  // simple protection
  const token = request.headers.get("x-import-token");
  if (!process.env.IMPORT_TOKEN || token !== process.env.IMPORT_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const accounts: AccountInput[] = Array.isArray(body?.accounts) ? body.accounts : [];
  if (!accounts.length) {
    return NextResponse.json(
      { error: 'Body must be { "accounts": [ ... ] }' },
      { status: 400 }
    );
  }

  // normalize + validate
  const rows = accounts
    .map((a) => ({
      name: (a.name || "").trim(),
      domain: (a.domain || "").trim() || null,
      tier: (a.tier || "P1").toString(),
      status: (a.status || "Prospecting").toString(),
      score: typeof a.score === "number" ? a.score : 0,
    }))
    .filter((r) => r.name.length > 0);

  if (!rows.length) {
    return NextResponse.json({ error: "No valid accounts found" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert(rows)
    .select("id,name,domain,tier,status,score,created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    accounts: data ?? [],
  });
}