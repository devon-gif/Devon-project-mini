import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/accounts/[id] — single account with people (for side panel).
 * Auth required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, name, domain, website_url, linkedin_url, tier, status, score")
    .eq("id", id)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const { data: people } = await supabase
    .from("people")
    .select("id, name, title, email, linkedin_url, notes")
    .eq("account_id", id)
    .order("name");

  return NextResponse.json({
    account: {
      id: account.id,
      name: account.name,
      domain: account.domain,
      website_url: account.website_url,
      linkedin_url: account.linkedin_url,
      tier: account.tier ?? "P1",
      status: account.status ?? "Prospecting",
      score: account.score ?? 0,
    },
    people: (people ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      email: p.email,
      linkedin_url: p.linkedin_url,
      notes: p.notes,
    })),
  });
}
