import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/invite-teammate — invite by email. Callable from Settings UI.
 * Requires logged-in user whose email is in ADMIN_EMAILS.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const { error: createError } = await admin.auth.admin.createUser({
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
        const inviteLink =
          linkData?.properties?.action_link ?? (linkData as { action_link?: string })?.action_link ?? null;
        return NextResponse.json({ email, inviteLink, message: "User already exists; recovery link generated." });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    const inviteLink =
      linkData?.properties?.action_link ?? (linkData as { action_link?: string })?.action_link ?? null;

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
