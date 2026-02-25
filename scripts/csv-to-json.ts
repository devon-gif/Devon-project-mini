/**
 * One-time import: Twill #100.csv → data/prospects.json
 * Run: npm run seed:prospects
 */
import * as fs from "fs";
import * as path from "path";

export type Prospect = {
  id: string;
  companyName: string;
  domain: string;
  linkedinUrl?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  signalScore: number;
  tier: "P0" | "P1" | "P2";
  status: string;
  lastTouch: string;
  nextAction: string;
  industry?: string;
  notes?: string;
};

const DEFAULT_TIER: Prospect["tier"] = "P0";
const DEFAULT_STATUS = "Prospecting";
const DEFAULT_LAST_TOUCH = "No touch";
const DEFAULT_NEXT_ACTION = "Add first touch";

function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const HEADER_ALIASES: Record<string, string[]> = {
  companyName: ["company", "company_name", "name", "company name", "account"],
  domain: ["website", "domain", "url", "company_website", "website url"],
  linkedinUrl: ["linkedin", "linkedin_url", "linkedin url", "linkedin link", "company_linkedin"],
  contactName: ["person", "contact", "contact_name", "contact name", "primary_contact", "name"],
  contactTitle: ["title", "contact_title", "contact title", "job_title", "role"],
  contactEmail: ["email", "contact_email", "contact email", "email_address"],
  signalScore: ["signal_score", "signal score", "score", "signal"],
  tier: ["tier", "priority"],
  status: ["status", "stage"],
  lastTouch: ["last_touch", "last touch", "last_activity"],
  nextAction: ["next_action", "next action", "next_step", "next step"],
  industry: ["industry", "vertical", "sector"],
  notes: ["notes", "note", "comments"],
};

function findHeaderKey(headers: string[], aliases: string[]): string | null {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const a of aliases) {
    const idx = lower.indexOf(a.toLowerCase());
    if (idx >= 0) return headers[idx].trim();
  }
  return null;
}

function parseCsv(content: string): string[][] {
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

function normalizeRow(
  headers: string[],
  values: string[],
  rowIndex: number
): Prospect | null {
  const get = (key: keyof typeof HEADER_ALIASES): string | undefined => {
    const rawKey = findHeaderKey(headers, HEADER_ALIASES[key]);
    if (!rawKey) return undefined;
    const idx = headers.indexOf(rawKey);
    if (idx < 0 || idx >= values.length) return undefined;
    const v = values[idx]?.trim();
    return v === "" ? undefined : v;
  };

  const companyName = get("companyName") ?? get("domain") ?? "";
  const domain = get("domain") ?? "";
  if (!companyName && !domain) return null;

  let tier = (get("tier")?.toUpperCase() ?? DEFAULT_TIER) as Prospect["tier"];
  if (!["P0", "P1", "P2"].includes(tier)) tier = DEFAULT_TIER;

  const signalRaw = get("signalScore");
  let signalScore = signalRaw ? parseInt(signalRaw, 10) : randomScore(65, 95);
  if (Number.isNaN(signalScore) || signalScore < 0 || signalScore > 100) signalScore = randomScore(65, 95);

  return {
    id: `prospect-${rowIndex + 1}`,
    companyName,
    domain: domain || (companyName ? `${companyName.toLowerCase().replace(/\s+/g, "")}.com` : ""),
    linkedinUrl: get("linkedinUrl"),
    contactName: get("contactName"),
    contactTitle: get("contactTitle"),
    contactEmail: get("contactEmail"),
    signalScore,
    tier,
    status: get("status") ?? DEFAULT_STATUS,
    lastTouch: get("lastTouch") ?? DEFAULT_LAST_TOUCH,
    nextAction: get("nextAction") ?? DEFAULT_NEXT_ACTION,
    industry: get("industry"),
    notes: get("notes"),
  };
}

function main() {
  const root = process.cwd();
  const csvPaths = [
    path.join(root, "Twill #100.csv"),
    path.join(root, "twill-100.csv"),
    path.join(root, "Twill #100.CSV"),
  ];
  let csvPath: string | null = null;
  for (const p of csvPaths) {
    if (fs.existsSync(p)) {
      csvPath = p;
      break;
    }
  }

  let prospects: Prospect[] = [];

  if (csvPath) {
    const content = fs.readFileSync(csvPath, "utf-8");
    const rows = parseCsv(content);
    if (rows.length < 2) {
      console.warn("CSV has no data rows. Writing empty prospects.");
      prospects = [];
    } else {
      const headers = rows[0];
      prospects = [];
      for (let i = 1; i < rows.length; i++) {
        const row = normalizeRow(headers, rows[i], i - 1);
        if (row) prospects.push(row);
      }
      console.log(`Parsed ${prospects.length} prospects from ${path.basename(csvPath)}`);
    }
  } else {
    console.warn("Twill #100.csv not found at repo root. Run with CSV at project root for real data.");
    try {
      const existingPath = path.join(root, "figma", "data", "twill100Prospects.ts");
      if (fs.existsSync(existingPath)) {
        const content = fs.readFileSync(existingPath, "utf-8");
        const start = content.indexOf("[");
        const end = content.lastIndexOf("];") + 1;
        if (start >= 0 && end > start) {
          const arr = JSON.parse(content.slice(start, end)) as Array<Record<string, unknown>>;
          prospects = arr.map((a, i) => ({
            id: (a.id as string) ?? `prospect-${i + 1}`,
            companyName: (a.company as string) ?? "",
            domain: (a.domain as string) ?? "",
            linkedinUrl: undefined,
            contactName: undefined,
            contactTitle: undefined,
            contactEmail: undefined,
            signalScore: (a.signalScore as number) ?? randomScore(65, 95),
            tier: ((a.tier as string) ?? "P0") as Prospect["tier"],
            status: (a.status as string) ?? DEFAULT_STATUS,
            lastTouch: (a.lastTouch as string) ?? DEFAULT_LAST_TOUCH,
            nextAction: (a.nextStep as string) ?? DEFAULT_NEXT_ACTION,
            industry: (a.industry as string) ?? undefined,
            notes: (a.notes as string) ?? undefined,
          }));
          console.log(`Converted ${prospects.length} prospects from figma/data/twill100Prospects.ts`);
        }
      }
    } catch (_e) {
      prospects = [];
    }
  }

  const dataDir = path.join(root, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "prospects.json"),
    JSON.stringify(prospects, null, 2),
    "utf-8"
  );
  const publicDir = path.join(root, "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(
    path.join(publicDir, "prospects.json"),
    JSON.stringify(prospects, null, 2),
    "utf-8"
  );
  console.log(`Wrote ${prospects.length} prospects to data/prospects.json and public/prospects.json`);
}

main();
