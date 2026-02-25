import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLeadsFromCsv, type LeadRow } from "@/lib/twillCsv";

export type LeadContact = {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  avatar_url?: string | null;
};

/** Normalize tier from DB to P0 | P1 | P2 */
function normalizeTier(t: string | null): "P0" | "P1" | "P2" {
  const s = (t || "").trim().toUpperCase();
  if (s.startsWith("P0")) return "P0";
  if (s.startsWith("P2")) return "P2";
  return "P1";
}

/**
 * GET /api/leads — list leads from Supabase (uploaded accounts + people) when available,
 * otherwise from Twill #100 CSV. Auth required.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prefer Supabase: accounts + people (e.g. from seed/import of 100 people)
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name, domain, website_url, linkedin_url, tier, status, score")
    .order("name");

  if (!accountsError && accounts?.length) {
    const ids = accounts.map((a) => a.id);
    const { data: people } = await supabase
      .from("people")
      .select("id, account_id, name, title, email, linkedin_url, avatar_url")
      .in("account_id", ids)
      .order("account_id");

    const contactsByLeadId: Record<string, LeadContact[]> = {};
    for (const p of people ?? []) {
      const aid = p.account_id;
      if (!contactsByLeadId[aid]) contactsByLeadId[aid] = [];
      contactsByLeadId[aid].push({
        id: p.id,
        name: p.name ?? null,
        title: p.title ?? null,
        email: p.email ?? null,
        linkedin_url: p.linkedin_url ?? null,
        avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null,
      });
    }

    const leads: LeadRow[] = accounts.map((a) => ({
      id: a.id,
      company: a.name ?? "—",
      domain: a.domain ?? "—",
      tier: normalizeTier(a.tier),
      industry: "—",
      status: a.status ?? "Prospecting",
      lastTouch: "No touch",
      nextAction: "Add first touch",
      signalScore: typeof a.score === "number" ? a.score : 0,
    }));

    return NextResponse.json({ leads, contactsByLeadId });
  }

  // Fallback: CSV-backed leads (e.g. twill-100.csv)
  const leads = getLeadsFromCsv();
  const contactsByLeadId: Record<string, LeadContact[]> = {};
  const companyToLeadId = new Map<string, string>();
  leads.forEach((l) => {
    const key = l.company.trim().toLowerCase();
    if (!companyToLeadId.has(key)) companyToLeadId.set(key, l.id);
  });

  try {
    const { people } = await import("@/figma/data/mockData");
    if (Array.isArray(people)) {
      people.forEach((p) => {
        const company = (p.company || "").trim().toLowerCase();
        const leadId = company ? companyToLeadId.get(company) : undefined;
        if (leadId) {
          if (!contactsByLeadId[leadId]) contactsByLeadId[leadId] = [];
          contactsByLeadId[leadId].push({
            id: p.id,
            name: p.name ?? null,
            title: p.title ?? null,
            email: p.email ?? null,
            linkedin_url: p.linkedin ? (p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`) : null,
            avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null,
          });
        }
      });
    }
  } catch {
    // No mock people or client-only module
  }

  return NextResponse.json({
    leads: leads as LeadRow[],
    contactsByLeadId,
  });
}
