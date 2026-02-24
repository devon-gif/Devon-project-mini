import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/accounts — list accounts from Supabase with first contact (for Accounts list).
 * Auth required.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name, domain, website_url, linkedin_url, tier, status, score")
    .order("name");

  if (accountsError) {
    return NextResponse.json({ error: accountsError.message }, { status: 500 });
  }

  if (!accounts?.length) {
    return NextResponse.json({ accounts: [] });
  }

  const ids = accounts.map((a) => a.id);
  const { data: people } = await supabase
    .from("people")
    .select("id, account_id, name, title, email, linkedin_url")
    .in("account_id", ids)
    .order("account_id");

  const firstByAccount = new Map<string, (typeof people)[0]>();
  for (const p of people ?? []) {
    if (!firstByAccount.has(p.account_id)) firstByAccount.set(p.account_id, p);
  }

  const list = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    domain: a.domain,
    website_url: a.website_url,
    linkedin_url: a.linkedin_url,
    tier: a.tier ?? "P1",
    status: a.status ?? "Prospecting",
    score: a.score ?? 0,
    firstContact: firstByAccount.get(a.id)
      ? {
          name: firstByAccount.get(a.id)!.name,
          title: firstByAccount.get(a.id)!.title,
          email: firstByAccount.get(a.id)!.email,
          linkedin_url: firstByAccount.get(a.id)!.linkedin_url,
        }
      : null,
  }));

  return NextResponse.json({ accounts: list });
}
