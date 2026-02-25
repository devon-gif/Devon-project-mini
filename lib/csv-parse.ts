import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Simple CSV parser with quoted field support. Used by seed-prospects API.
 */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) {
      cell += c;
      continue;
    }
    if (c === ",") {
      current.push(cell.trim());
      cell = "";
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && content[i + 1] === "\n") i++;
      current.push(cell.trim());
      cell = "";
      if (current.some((s) => s.length > 0)) rows.push(current);
      current = [];
      continue;
    }
    cell += c;
  }
  if (cell.length > 0 || current.length > 0) {
    current.push(cell.trim());
    rows.push(current);
  }
  return rows;
}

const HEADER_MAP: Record<string, string[]> = {
  company: ["company", "company_name", "name", "company name", "account"],
  domain: ["domain", "website", "url", "company_website", "website url"],
  website_url: ["website_url", "website url", "website", "url"],
  linkedin_url: ["linkedin", "linkedin_url", "linkedin url", "company_linkedin"],
  person: ["person", "contact", "contact_name", "contact name", "name", "primary_contact"],
  name: ["name", "person", "contact", "contact_name"],
  title: ["title", "contact_title", "contact title", "job_title", "role"],
  email: ["email", "contact_email", "contact email", "email_address"],
};

function findColumnIndex(headers: string[], keys: string[]): number {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const k of keys) {
    const idx = lower.indexOf(k.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

export type CsvProspectRow = {
  company: string;
  domain: string;
  website_url: string;
  linkedin_url: string;
  person_name: string;
  title: string;
  email: string;
};

export function mapCsvToProspects(rows: string[][]): CsvProspectRow[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const result: CsvProspectRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const get = (key: keyof typeof HEADER_MAP): string => {
      const idx = findColumnIndex(headers, HEADER_MAP[key] || [key]);
      if (idx < 0 || idx >= values.length) return "";
      return (values[idx] ?? "").trim();
    };
    const company = get("company");
    const domain = get("domain") || get("website_url").replace(/^https?:\/\//, "").split("/")[0] || "";
    const website = get("website_url") || (domain ? `https://${domain}` : "");
    const personName = get("person") || get("name");
    const email = get("email");
    if (!company && !domain && !personName && !email) continue;
    result.push({
      company: company || domain || "Unknown",
      domain: domain || (company ? `${company.toLowerCase().replace(/\s+/g, "")}.com` : ""),
      website_url: website,
      linkedin_url: get("linkedin_url"),
      person_name: personName,
      title: get("title"),
      email,
    });
  }
  return result;
}

export type LoadedProspectRow = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  linkedin_url: string | null;
  website_url: string | null;
};

/**
 * Load prospects from Twill #100.csv at project root. Used by /api/prospects/seed.
 */
export function loadProspectsFromCsv(): LoadedProspectRow[] {
  const path = join(process.cwd(), "Twill #100.csv");
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf-8");
  const rows = parseCsv(content);
  const prospects = mapCsvToProspects(rows);
  return prospects.map((p) => ({
    id: randomUUID(),
    name: p.person_name || p.company || "Unknown",
    title: p.title || null,
    company: p.company || null,
    email: p.email || null,
    linkedin_url: p.linkedin_url || null,
    website_url: p.website_url || null,
  }));
}
