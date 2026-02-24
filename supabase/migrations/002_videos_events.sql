-- Videos + video_events for persistence. Run after 001_accounts_people.
-- If you already ran 001_create_videos.sql, skip or run only missing parts.

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_user_id uuid,
  title text not null,
  recipient_name text,
  recipient_company text,
  recipient_email text,
  cta_label text default 'Book 15 min',
  cta_url text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready', 'sent', 'viewed', 'clicked', 'booked')),
  video_path text not null default '',
  gif_path text,
  public_token text unique,
  sent_at timestamptz,
  stats_views int default 0,
  stats_clicks int default 0,
  stats_watch_25 int default 0,
  stats_watch_50 int default 0,
  stats_watch_75 int default 0,
  stats_watch_100 int default 0
);

create index if not exists idx_videos_public_token on public.videos(public_token);
create index if not exists idx_videos_owner_user_id on public.videos(owner_user_id);

create table if not exists public.video_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  video_id uuid not null references public.videos(id) on delete cascade,
  session_id text,
  event_type text not null,
  meta jsonb
);

create index if not exists idx_video_events_video_id_created_at on public.video_events(video_id, created_at desc);
