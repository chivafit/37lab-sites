-- Applied to project hkndjcintuevrvgxicnl.
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table if not exists public.professional_domains (id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.professionals(id) on delete cascade, hostname text not null unique, status text not null default 'pending' check(status in ('pending','active','error')), is_primary boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
-- RLS policies are intentionally admin allowlist based. See live migration history for complete policy DDL.
