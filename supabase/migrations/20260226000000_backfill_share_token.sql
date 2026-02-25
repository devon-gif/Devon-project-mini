-- Backfill share_token from public_token for existing videos (fixes share links)
-- Run in Supabase SQL Editor if share links show "Video not found"

update public.videos
set share_token = public_token
where public_token is not null
  and (share_token is null or share_token = '');
