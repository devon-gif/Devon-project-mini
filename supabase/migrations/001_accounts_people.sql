-- Accounts + People for CRM (Supabase). Run in Dashboard → SQL Editor.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  domain text unique,
  website_url text,
  linkedin_url text,
  tier text not null default 'P1',
  status text not null default 'Prospecting',
  score int default 0
);

create index if not exists idx_accounts_domain on public.accounts(domain);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  account_id uuid references public.accounts(id) on delete cascade,
  name text,
  title text,
  email text,
  linkedin_url text,
  notes text
);

create index if not exists idx_people_account_id on public.people(account_id);
create index if not exists idx_people_email on public.people(email);
create unique index if not exists idx_people_account_email on public.people(account_id, email) where email is not null;
