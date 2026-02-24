import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, listPeople } from "@/lib/db";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

/**
 * GET /api/prospects — list prospects (from SQLite people table when USE_LOCAL_VIDEOS).
 * Used by Accounts page for real CSV-backed data.
 */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (USE_LOCAL) {
    try {
      getDb();
      const people = listPeople();
      return NextResponse.json({
        prospects: people.map((p) => ({
          id: p.id,
          name: p.name,
          title: p.title,
          company: p.company,
          email: p.email,
          linkedin_url: p.linkedin_url,
          website_url: p.website_url,
        })),
      });
    } catch (e) {
      console.error("GET /api/prospects (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "DB error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ prospects: [] });
}
