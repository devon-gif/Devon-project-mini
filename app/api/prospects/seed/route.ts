import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Seed disabled" }, { status: 403 });
}
