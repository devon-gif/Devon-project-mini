import fs from "node:fs";
import path from "node:path";

// ---- CONFIG ----
// Update this filename if Finder wraps it differently
const CSV_PATH = path.join(
  process.env.HOME,
  "Desktop",
  "GitHub",
  "twill_prospects_1_100.csv"
);

const ENDPOINT = "http://localhost:3000/api/import/accounts";

// Must match your IMPORT_TOKEN in .env.local
const IMPORT_TOKEN =
  process.env.IMPORT_TOKEN ||
  "rjzYq5mH8vP2nT4wK9cS7xG1aD6uF3eL0bN5qR8tV2yJ7pX4zM9hQ1sW6kE3cU8";

const BATCH_SIZE = 50;

// ---- CSV PARSER (handles quoted commas) ----
function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? "").trim();
    });
    rows.push(obj);
  }
  return rows;
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] && String(obj[k]).trim()) return String(obj[k]).trim();
  }
  return "";
}

function toAccount(row) {
  const name = pick(row, ["name", "company", "Company", "Company Name", "Account"]);
  const domain = pick(row, ["domain", "website", "Website", "url", "URL"]);
  const tier = (pick(row, ["tier", "Tier"]) || "P1").toUpperCase();
  const status = pick(row, ["status", "Status"]) || "Prospecting";

  const scoreRaw = pick(row, ["score", "Score"]);
  const score = scoreRaw ? Number(scoreRaw) : 0;

  return {
    name,
    domain: domain || null,
    tier,
    status,
    score: Number.isFinite(score) ? score : 0,
  };
}

async function postBatch(batch) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-import-token": IMPORT_TOKEN,
    },
    body: JSON.stringify({ accounts: batch }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Batch failed:", json);
    process.exit(1);
  }
  return json;
}

(async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("CSV file not found at:", CSV_PATH);
    console.error("Fix CSV_PATH in scripts/import-accounts.mjs to match your exact filename.");
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(raw);

  const accounts = rows
    .map(toAccount)
    .filter((a) => a.name && a.name.length > 0);

  console.log(`Loaded ${rows.length} CSV rows, mapped ${accounts.length} accounts.`);

  if (!accounts.length) {
    console.error("No accounts mapped. Your CSV headers may be different.");
    console.error("Open the CSV and tell me the header row, and I'll adjust the mapping.");
    process.exit(1);
  }

  let insertedTotal = 0;

  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);
    const result = await postBatch(batch);
    insertedTotal += result.inserted || 0;
    console.log(`Inserted ${result.inserted} (total ${insertedTotal})`);
  }

  console.log("✅ Done. Total inserted:", insertedTotal);
})();
