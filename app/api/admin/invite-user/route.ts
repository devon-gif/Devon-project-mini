import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/invite-user
 * Body: { email: string }
 * Header: x-admin-token: <ADMIN_TOKEN>
 * Creates user (if needed) and returns a magic/set-password link.
 */
export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token");
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || !token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const tempPassword = `Tmp${Math.random().toString(36).slice(2, 14)}!`;

  try {
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
        const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
          type: "recovery",
          email,
        });
        if (linkError) {
          return NextResponse.json(
            { error: "User exists; could not generate link: " + linkError.message },
            { status: 500 }
          );
        }
        return NextResponse.json({
          email,
          inviteLink: linkData?.properties?.action_link ?? null,
          message: "User already exists; recovery link generated.",
        });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    const inviteLink =
      linkData?.properties?.action_link ??
      (linkData as { action_link?: string })?.action_link ??
      null;

    return NextResponse.json({
      email,
      inviteLink,
      tempPassword: inviteLink ? undefined : tempPassword,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invite failed" },
      { status: 500 }
    );
  }
}
