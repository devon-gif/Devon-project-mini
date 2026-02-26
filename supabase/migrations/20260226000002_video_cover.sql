-- Add cover_path for video thumbnail (PNG/JPG upload or screenshot, like YouTube)
-- Replaces GIF generation for email attachment

alter table public.videos add column if not exists cover_path text;
