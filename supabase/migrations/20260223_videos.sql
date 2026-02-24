-- Videos table for demo
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz default now(),
  video_path text not null,
  gif_path text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready')),
  landing_slug text
);

-- Storage bucket "videos" - create via Supabase Dashboard or:
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', true);
