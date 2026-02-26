import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Prefer service role for server routes (signed URLs, bypass RLS when needed)
  const key = serviceKey || anonKey;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
