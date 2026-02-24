import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, listPeople } from "@/lib/db";

const USE_LOCAL = process.env.USE_LOCAL_VIDEOS === "true";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (USE_LOCAL) {
    try {
      getDb();
      const people = listPeople();
      return NextResponse.json({ people });
    } catch (e) {
      console.error("GET /api/people (local)", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "DB error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ people: [] });
}
