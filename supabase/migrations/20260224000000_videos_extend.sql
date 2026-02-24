-- Extend videos table for full Video Outreach flow
-- Run after 20260223_videos.sql

-- Add columns if not present (idempotent)
alter table public.videos add column if not exists owner_user_id uuid references auth.users(id);
alter table public.videos add column if not exists recipient_name text;
alter table public.videos add column if not exists recipient_company text;
alter table public.videos add column if not exists recipient_email text;
alter table public.videos add column if not exists cta_type text check (cta_type in ('book', 'forward'));
alter table public.videos add column if not exists cta_url text;
alter table public.videos add column if not exists public_token text unique;
alter table public.videos add column if not exists stats_views int default 0;
alter table public.videos add column if not exists stats_clicks int default 0;
alter table public.videos add column if not exists stats_watch_percent int default 0;

-- Extend status check: drop old constraint and add new one
alter table public.videos drop constraint if exists videos_status_check;
alter table public.videos add constraint videos_status_check check (
  status in ('draft', 'processing', 'ready', 'sent', 'viewed', 'clicked', 'booked')
);

-- Index for public landing lookup
create unique index if not exists videos_public_token_key on public.videos(public_token) where public_token is not null;

-- Storage: ensure buckets exist (run in Dashboard if needed)
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', true), ('gifs', 'gifs', true) on conflict (id) do nothing;
