import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const userId = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  if (error || !code || !userId) {
    return NextResponse.redirect(`${baseUrl}/app/inbox?gmail_error=1`);
  }
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${baseUrl}/api/inbox/gmail/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) {
    console.error("[gmail callback] token exchange failed", tokens);
    return NextResponse.redirect(`${baseUrl}/app/inbox?gmail_error=1`);
  }
  const profileRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();
  const admin = createAdminClient();
  await admin.from("user_settings").upsert({
    user_id: userId,
    gmail_access_token: tokens.access_token,
    gmail_refresh_token: tokens.refresh_token,
    gmail_email: profile.emailAddress,
    gmail_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  }, { onConflict: "user_id" });
  return NextResponse.redirect(`${baseUrl}/app/inbox?gmail_connected=1`);
}
