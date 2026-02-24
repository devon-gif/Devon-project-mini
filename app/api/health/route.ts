import { NextResponse } from "next/server";

/** GET /api/health — no auth. Returns 200 with { ok: true } for deployment checks. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
