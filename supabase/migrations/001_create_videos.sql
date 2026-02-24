-- Videos + video_events schema for Supabase (persistent video uploads + share landing)
-- Run this in Supabase Dashboard → SQL Editor (or via Supabase CLI).

-- Videos: metadata + storage paths + share token
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_user_id uuid null,
  title text not null,
  recipient_name text,
  recipient_company text,
  recipient_email text,
  cta_label text default 'Book 15 min',
  cta_url text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready', 'sent', 'viewed', 'clicked', 'booked')),
  storage_video_path text not null default '',
  storage_gif_path text null,
  share_token text unique not null,
  sent_at timestamptz null,
  stats_views int default 0,
  stats_clicks int default 0,
  stats_watch_25 int default 0,
  stats_watch_50 int default 0,
  stats_watch_75 int default 0,
  stats_watch_100 int default 0
);

create index if not exists idx_videos_share_token on public.videos(share_token);
create index if not exists idx_videos_owner_user_id on public.videos(owner_user_id);

-- Video events: analytics from public share page (page_view, play, progress, cta_click)
create table if not exists public.video_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  video_id uuid not null references public.videos(id) on delete cascade,
  session_id text,
  event_type text not null,
  meta jsonb null
);

create index if not exists idx_video_events_video_id_created_at on public.video_events(video_id, created_at desc);

-- Storage buckets: create in Dashboard → Storage (or run below if you have access)
-- Bucket "videos": private preferred (use signed URLs in app); or public for demo.
-- Bucket "gifs": public OK.
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', false), ('gifs', 'gifs', true) on conflict (id) do update set public = excluded.public;
