import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ connected: false });
  try {
    const admin = createAdminClient();
    const { data: settings } = await admin.from("user_settings").select("gmail_email, gmail_access_token").eq("user_id", data.user.id).single();
    return NextResponse.json({ connected: !!(settings?.gmail_access_token), email: settings?.gmail_email ?? null });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
