# Deploy (Render / production)

## Required: Supabase schema

**"Could not find the table 'public.videos'"** → Run **`supabase/migrations/000_bootstrap_public_videos.sql`** in Supabase SQL Editor.

**"Could not find the 'public_token' column of 'videos'"** → Run **`supabase/migrations/000_add_app_columns.sql`** in Supabase SQL Editor (adds `public_token`, `video_path`, `gif_path`, stats columns).

**Share links show "Video not found"** → Run **`supabase/migrations/20260226000000_backfill_share_token.sql`** to backfill `share_token` for existing videos.

**Inbox shows no data** → Run **`supabase/migrations/20260226000001_activity_and_inbox.sql`** to create `activity_events` and `inbox_messages` tables.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Copy the migration file contents, paste, and click **Run**.
3. Retry Create Video in the app.

Storage buckets (`videos`, `covers`, `gifs`) are created automatically on first use. Run **`supabase/migrations/20260226000002_video_cover.sql`** to add the `cover_path` column.

## Env vars (Render)

Set in Render Dashboard → Environment:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-only)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key for client auth

Optional: `ADMIN_SECRET` for admin/self-test endpoints; `USE_LOCAL_VIDEOS=true` only for local dev.

**Share links show "Video not found"?** Ensure:
1. Run `supabase/migrations/20260226000000_backfill_share_token.sql` to backfill existing videos.
2. In Supabase Dashboard → Storage → `videos` bucket → make it **Public** (or set `NEXT_PUBLIC_SUPABASE_VIDEOS_BUCKET_PUBLIC=true` on Render).

## Smoke test

After deploy:

- `GET /api/health` → `{ "ok": true, ... }`
- Log in → Videos → Create Video → Select recipient → Upload → Generate & Send (after running the bootstrap SQL above).
