-- Add columns the app expects (public_token, video_path, gif_path, etc.)
-- Run in Supabase SQL Editor if you see "Could not find the 'public_token' column of 'videos'".

alter table public.videos add column if not exists public_token text unique;
alter table public.videos add column if not exists video_path text not null default '';
alter table public.videos add column if not exists gif_path text;
alter table public.videos add column if not exists landing_slug text;
alter table public.videos add column if not exists stats_views int default 0;
alter table public.videos add column if not exists stats_clicks int default 0;
alter table public.videos add column if not exists stats_watch_25 int default 0;
alter table public.videos add column if not exists stats_watch_50 int default 0;
alter table public.videos add column if not exists stats_watch_75 int default 0;
alter table public.videos add column if not exists stats_watch_100 int default 0;
alter table public.videos add column if not exists stats_avg_watch_percent int default 0;
alter table public.videos add column if not exists stats_bookings int default 0;

create unique index if not exists idx_videos_public_token on public.videos(public_token) where public_token is not null;

-- Force PostgREST to reload schema cache (fixes "column not found" until cache refreshes)
notify pgrst, 'reload schema';
