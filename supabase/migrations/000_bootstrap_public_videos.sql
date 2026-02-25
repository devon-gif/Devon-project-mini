-- Bootstrap for public.videos (+ events) used by the app.
-- Safe to run multiple times.

-- Extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- Videos table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Who created it (optional, if you wire to auth)
  owner_user_id uuid null,

  title text null,

  recipient_name text null,
  recipient_company text null,
  recipient_email text null,

  status text not null default 'draft', -- draft|uploading|uploaded|processing|ready|sent|failed
  sent_at timestamptz null,

  -- Storage paths (app uses video_path, gif_path)
  video_path text not null default '',
  gif_path text null,
  storage_video_path text null,
  storage_gif_path text null,
  storage_thumb_path text null,

  -- Public share token for landing page (app uses public_token)
  public_token text unique null,
  share_token text unique null,

  cta_type text null default 'book',

  cta_label text null default 'Book 15 min',
  cta_url text null,

  error text null
);

create index if not exists videos_created_at_idx on public.videos(created_at desc);
create index if not exists videos_share_token_idx on public.videos(share_token);

-- Events table (public landing page tracking)
create table if not exists public.video_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  video_id uuid not null references public.videos(id) on delete cascade,
  session_id text null,
  event_type text not null, -- landing_view|play|progress_25|progress_50|progress_75|progress_100|cta_click|gif_click
  meta jsonb null
);

create index if not exists video_events_video_id_created_at_idx on public.video_events(video_id, created_at desc);

-- --------------------------
-- RLS (Row Level Security)
-- --------------------------
alter table public.videos enable row level security;
alter table public.video_events enable row level security;

-- If you are not using Supabase auth yet, you can temporarily allow full access.
-- If you ARE using auth, tighten these policies later.

-- Allow authenticated users full CRUD on videos (simple baseline)
drop policy if exists "videos auth read" on public.videos;
create policy "videos auth read" on public.videos
for select to authenticated
using (true);

drop policy if exists "videos auth write" on public.videos;
create policy "videos auth write" on public.videos
for insert to authenticated
with check (true);

drop policy if exists "videos auth update" on public.videos;
create policy "videos auth update" on public.videos
for update to authenticated
using (true)
with check (true);

-- Public can read a video ONLY if it has a public_token or share_token (for landing page)
drop policy if exists "videos public read via token" on public.videos;
create policy "videos public read via token" on public.videos
for select to anon
using (public_token is not null or share_token is not null);

-- Events: allow public insert (landing page tracking)
drop policy if exists "events public insert" on public.video_events;
create policy "events public insert" on public.video_events
for insert to anon
with check (true);

-- Authenticated users can read events (dashboard)
drop policy if exists "events auth read" on public.video_events;
create policy "events auth read" on public.video_events
for select to authenticated
using (true);
