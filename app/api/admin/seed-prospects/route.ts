import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseCsv, mapCsvToProspects } from "@/lib/csv-parse";
import * as fs from "fs";
import * as path from "path";

function findCsvPath(): string | null {
  const root = process.cwd();
  const candidates = [
    path.join(root, "Twill #100.csv"),
    path.join(root, "data", "Twill_100.csv"),
    path.join(root, "data", "Twill #100.csv"),
    path.join(root, "public", "Twill_100.csv"),
    path.join(root, "twill-100.csv"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

export async function POST(request: Request) {
  const token = request.headers.get("x-seed-token");
  const expected = process.env.SEED_TOKEN;
  if (!expected || !token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csvPath = findCsvPath();
  if (!csvPath) {
    return NextResponse.json(
      { error: "CSV not found. Place Twill #100.csv in project root or data/ or public/." },
      { status: 404 }
    );
  }

  let content: string;
  try {
    content = fs.readFileSync(csvPath, "utf-8");
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read CSV: " + (e instanceof Error ? e.message : "unknown") },
      { status: 500 }
    );
  }

  const rows = parseCsv(content);
  const prospects = mapCsvToProspects(rows);
  if (prospects.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, updated: 0, message: "No rows to import" });
  }

  const admin = createAdminClient();
  let accountsInserted = 0;
  let accountsUpdated = 0;
  let peopleInserted = 0;
  let peopleUpdated = 0;
  const accountKeyToId = new Map<string, string>();

  for (const p of prospects) {
    const domain = (p.domain || "").trim() || null;
    const accountKey = domain ?? `name:${(p.company || "unknown").toLowerCase().trim()}`;
    const accountPayload = {
      name: (p.company || "Unknown").trim(),
      domain,
      website_url: (p.website_url || "").trim() || null,
      linkedin_url: (p.linkedin_url || "").trim() || null,
      tier: "P1",
      status: "Prospecting",
      score: 0,
    };

    let accountId = accountKeyToId.get(accountKey);
    if (!accountId) {
      if (domain) {
        const { data: existing } = await admin.from("accounts").select("id").eq("domain", domain).maybeSingle();
        if (existing?.id) {
          accountId = existing.id;
          accountKeyToId.set(accountKey, accountId);
          await admin.from("accounts").update(accountPayload).eq("id", accountId);
          accountsUpdated++;
        }
      }
      if (!accountId) {
        const { data: inserted, error } = await admin.from("accounts").insert(accountPayload).select("id").single();
        if (error) continue;
        accountId = inserted?.id;
        if (accountId) {
          accountKeyToId.set(accountKey, accountId);
          accountsInserted++;
        }
      }
    }

    if (!accountId) continue;

    const personPayload = {
      account_id: accountId,
      name: (p.person_name || "").trim() || null,
      title: (p.title || "").trim() || null,
      email: (p.email || "").trim() || null,
      linkedin_url: (p.linkedin_url || "").trim() || null,
    };

    const emailVal = (p.email || "").trim() || null;
    let existingId: string | null = null;
    if (emailVal) {
      const { data: byEmail } = await admin
        .from("people")
        .select("id")
        .eq("account_id", accountId)
        .eq("email", emailVal)
        .maybeSingle();
      existingId = byEmail?.id ?? null;
    }

    if (existingId) {
      await admin.from("people").update(personPayload).eq("id", existingId);
      peopleUpdated++;
    } else {
      const { error } = await admin.from("people").insert(personPayload);
      if (!error) peopleInserted++;
    }
  }

  return NextResponse.json({
    ok: true,
    inserted: { accounts: accountsInserted, people: peopleInserted },
    updated: { accounts: accountsUpdated, people: peopleUpdated },
    rowsProcessed: prospects.length,
  });
}
