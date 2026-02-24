-- video_events: append-only event log for analytics
create table if not exists public.video_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  video_id uuid not null references public.videos(id) on delete cascade,
  session_id text not null,
  event_type text not null check (event_type in (
    'page_view', 'gif_click', 'video_play', 'watch_progress', 'video_complete',
    'cta_click', 'booking', 'email_delivered', 'email_opened'
  )),
  progress_percent int check (progress_percent is null or progress_percent in (25, 50, 75, 100)),
  user_agent text,
  ip_hash text,
  referrer text
);

create index if not exists video_events_video_id_created_at on public.video_events(video_id, created_at desc);
create index if not exists video_events_dedup on public.video_events(video_id, session_id, event_type, progress_percent);

-- videos: add stats and sent_at
alter table public.videos add column if not exists sent_at timestamptz;
alter table public.videos add column if not exists stats_bookings int default 0;
alter table public.videos add column if not exists stats_watch_25 int default 0;
alter table public.videos add column if not exists stats_watch_50 int default 0;
alter table public.videos add column if not exists stats_watch_75 int default 0;
alter table public.videos add column if not exists stats_watch_100 int default 0;
alter table public.videos add column if not exists stats_avg_watch_percent int default 0;
