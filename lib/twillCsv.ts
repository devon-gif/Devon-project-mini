/**
 * Server-only: load and parse data/twill-100.csv into typed Lead rows.
 * Uses Node fs; do not import from client.
 */

import * as fs from "fs";
import * as path from "path";

export type LeadRow = {
  id: string;
  company: string;
  domain: string;
  tier: "P0" | "P1" | "P2";
  industry: string;
  status: string;
  lastTouch: string;
  nextAction: string;
  signalScore: number;
  // CSV columns for detail panel
  employees?: string;
  growthPct?: string;
  source?: string;
  primaryBuyerTitles?: string;
  secondaryTitles?: string;
  triggerToMention?: string;
  linkedinCompanySearch?: string;
  crunchbaseSearch?: string;
};

const CSV_PATH = path.join(process.cwd(), "data", "twill-100.csv");

function parseTier(raw: string): "P0" | "P1" | "P2" {
  const t = (raw || "").trim();
  if (t.startsWith("P0")) return "P0";
  if (t.startsWith("P1")) return "P1";
  if (t.startsWith("P2")) return "P2";
  return "P1";
}

/** Parse CSV: one comma per column; columns are Tier,Company,Domain,Industry,Employees,Growth %,Source,Primary Buyer Titles,Secondary Titles,Trigger to mention,LinkedIn company search,Crunchbase search (12 cols). */
function parseCsvLines(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  return lines.map((line) => line.split(",").map((c) => c.trim()));
}

export function getLeadsFromCsv(): LeadRow[] {
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsvLines(content);
  if (rows.length < 2) return [];

  // Column order: Tier,Company,Domain,Industry,Employees,Growth %,Source,Primary Buyer Titles,Secondary Titles,Trigger to mention,LinkedIn company search,Crunchbase search
  const tierIdx = 0, companyIdx = 1, domainIdx = 2, industryIdx = 3, employeesIdx = 4, growthIdx = 5;
  const sourceIdx = 6, primaryIdx = 7, secondaryIdx = 8, triggerIdx = 9, linkedInIdx = 10, crunchbaseIdx = 11;
  const get = (row: string[], i: number) => (row[i] !== undefined ? String(row[i]).trim() : "");

  const statuses = ["Prospecting", "Prospecting", "Prospecting", "Nurturing", "Active"];
  const leads: LeadRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = get(row, companyIdx) || "—";
    const domain = get(row, domainIdx) || "—";
    const rawTier = get(row, tierIdx);
    const tier = parseTier(rawTier);
    const id = `lead-${i}`;
    const signalScore = 70 + (i % 26);

    leads.push({
      id,
      company,
      domain,
      tier,
      industry: get(row, industryIdx) || "—",
      status: statuses[i % statuses.length],
      lastTouch: "No touch",
      nextAction: "Add first touch",
      signalScore,
      employees: get(row, employeesIdx) || undefined,
      growthPct: get(row, growthIdx) || undefined,
      source: get(row, sourceIdx) || undefined,
      primaryBuyerTitles: get(row, primaryIdx) || undefined,
      secondaryTitles: get(row, secondaryIdx) || undefined,
      triggerToMention: get(row, triggerIdx) || undefined,
      linkedinCompanySearch: get(row, linkedInIdx) || undefined,
      crunchbaseSearch: get(row, crunchbaseIdx) || undefined,
    });
  }

  return leads;
}
