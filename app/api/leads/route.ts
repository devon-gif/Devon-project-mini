import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLeadsFromCsv, type LeadRow } from "@/lib/twillCsv";

export type LeadContact = {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
};

/**
 * GET /api/leads — list leads from Twill #100 CSV and optional contacts per lead.
 * Auth required. Contacts are matched by company/domain from existing people dataset when available.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = getLeadsFromCsv();
  const contactsByLeadId: Record<string, LeadContact[]> = {};

  // Try to attach people by company match (mockData.people or Supabase people)
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
