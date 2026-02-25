-- Add optional profile image URL for people (e.g. from manual paste or future integration).
alter table public.people add column if not exists avatar_url text;
