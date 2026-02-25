# Deploy (Render / production)

## Required: Supabase schema (fix "Could not find the table 'public.videos'")

If the app shows **"Could not find the table 'public.videos' in the schema cache"**, the database is missing the tables.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Copy the full contents of **`supabase/migrations/000_bootstrap_public_videos.sql`**.
3. Paste and click **Run**. You should see "Success. No rows returned."
4. Retry Create Video in the app; upload and GIF generation should work.

Storage buckets (`videos`, `gifs`) are created automatically by the app on first use if missing.

## Env vars (Render)

Set in Render Dashboard → Environment:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-only)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key for client auth

Optional: `ADMIN_SECRET` for admin/self-test endpoints; `USE_LOCAL_VIDEOS=true` only for local dev.

## Smoke test

After deploy:

- `GET /api/health` → `{ "ok": true, ... }`
- Log in → Videos → Create Video → Select recipient → Upload → Generate & Send (after running the bootstrap SQL above).
