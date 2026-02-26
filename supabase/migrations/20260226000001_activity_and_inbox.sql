-- Activity events + Inbox messages for functional inbox
-- Run in Supabase SQL Editor if activity_events or inbox_messages don't exist

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  account_id uuid references public.accounts(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  type text not null check (type in ('touch_sent', 'reply', 'meeting_booked', 'note')),
  channel text,
  summary text
);

create index if not exists idx_activity_events_account_id on public.activity_events(account_id);
create index if not exists idx_activity_events_created_at on public.activity_events(created_at desc);
create index if not exists idx_activity_events_type on public.activity_events(type);

-- Inbox messages: manual entries + structured email-like threads
create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  account_id uuid references public.accounts(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  subject text not null default '',
  body text,
  direction text not null default 'inbound' check (direction in ('inbound', 'outbound')),
  type text not null default 'email' check (type in ('email', 'touch', 'reply', 'meeting', 'note')),
  read boolean not null default false,
  metadata jsonb
);

create index if not exists idx_inbox_messages_account_id on public.inbox_messages(account_id);
create index if not exists idx_inbox_messages_created_at on public.inbox_messages(created_at desc);
create index if not exists idx_inbox_messages_read on public.inbox_messages(read);

-- RLS
alter table public.activity_events enable row level security;
alter table public.inbox_messages enable row level security;

drop policy if exists "activity_events auth" on public.activity_events;
create policy "activity_events auth" on public.activity_events for all to authenticated using (true) with check (true);

drop policy if exists "inbox_messages auth" on public.inbox_messages;
create policy "inbox_messages auth" on public.inbox_messages for all to authenticated using (true) with check (true);
