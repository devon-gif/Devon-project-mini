-- Bootstrap: create public.videos and public.video_events if missing.
-- Run once in Supabase Dashboard → SQL Editor (or via Supabase CLI) to fix "Could not find the table 'public.videos' in the schema cache".

-- Videos: full schema expected by the app (create + upload + generate-gif + events)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_user_id uuid references auth.users(id),
  title text not null,
  video_path text not null default '',
  gif_path text,
  landing_slug text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready', 'sent', 'viewed', 'clicked', 'booked')),
  recipient_name text,
  recipient_company text,
  recipient_email text,
  cta_type text check (cta_type is null or cta_type in ('book', 'forward')),
  cta_url text,
  cta_label text default 'Book 15 min',
  public_token text unique,
  sent_at timestamptz,
  stats_views int default 0,
  stats_clicks int default 0,
  stats_watch_25 int default 0,
  stats_watch_50 int default 0,
  stats_watch_75 int default 0,
  stats_watch_100 int default 0,
  stats_avg_watch_percent int default 0,
  stats_bookings int default 0
);

create index if not exists idx_videos_public_token on public.videos(public_token);
create index if not exists idx_videos_owner_user_id on public.videos(owner_user_id);

-- Video events: analytics from share page
create table if not exists public.video_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  video_id uuid not null references public.videos(id) on delete cascade,
  session_id text,
  event_type text not null,
  meta jsonb,
  progress_percent int,
  user_agent text,
  ip_hash text
);

create index if not exists idx_video_events_video_id_created_at on public.video_events(video_id, created_at desc);
