import { NextResponse } from "next/server";
import { loadProspectsFromCsv } from "@/lib/csv-parse";
import { getDb, insertPerson } from "@/lib/db";

/**
 * Dev-only: load Twill #100.csv into DB (people table).
 * Call once after placing CSV at project root.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed disabled in production" }, { status: 403 });
  }
  try {
    const rows = loadProspectsFromCsv();
    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No CSV found (place Twill #100.csv at project root) or no rows parsed",
        inserted: 0,
      });
    }
    const db = getDb();
    db.prepare("DELETE FROM people").run();
    for (const r of rows) {
      insertPerson({
        id: r.id,
        name: r.name,
        title: r.title,
        company: r.company,
        email: r.email,
        linkedin_url: r.linkedin_url,
        website_url: r.website_url,
      });
    }
    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (e) {
    console.error("POST /api/prospects/seed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
