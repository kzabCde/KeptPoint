create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  public_profile_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$')
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  logo_url text,
  cover_url text,
  color text,
  program_type text not null check (program_type in ('points','stamps','hybrid')),
  visibility text not null default 'public' check (visibility in ('public','private','invite_only')),
  join_mode text not null default 'open' check (join_mode in ('open','approval','invite_only')),
  status text not null default 'active' check (status in ('draft','active','paused','archived')),
  currency_name text not null default 'Points',
  terms text,
  allow_point_transfer boolean not null default false,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_members (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('pending','active','blocked','left')),
  joined_at timestamptz not null default now(),
  last_activity_at timestamptz,
  unique(program_id,user_id)
);

create table if not exists public.program_staff (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','cashier')),
  created_at timestamptz not null default now(),
  unique(program_id,user_id)
);

create table if not exists public.point_accounts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  reserved_balance bigint not null default 0 check (reserved_balance >= 0 and reserved_balance <= balance),
  lifetime_earned bigint not null default 0 check (lifetime_earned >= 0),
  lifetime_redeemed bigint not null default 0 check (lifetime_redeemed >= 0),
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(program_id,user_id)
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete set null,
  amount bigint not null check (amount <> 0),
  type text not null check (type in ('earn','bonus','redeem','transfer','adjustment','refund','reversal','expiration')),
  source text not null default 'manual' check (source in ('manual','qr','purchase','reward','admin','campaign','transfer','system')),
  reference_id uuid,
  reversal_of uuid references public.point_transactions(id) on delete restrict,
  note text,
  status text not null default 'completed' check (status in ('pending','completed','reversed','voided')),
  idempotency_key uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists point_transactions_idempotency_unique on public.point_transactions(program_id,idempotency_key) where idempotency_key is not null;

create table if not exists public.stamp_cards (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null default 'Stamp Card',
  required_stamps integer not null check (required_stamps between 2 and 100),
  max_stamps_per_transaction integer not null default 1 check (max_stamps_per_transaction between 1 and 100),
  reset_behavior text not null default 'new_round' check (reset_behavior in ('new_round','reset_same','remain_completed')),
  expires_in_days integer check (expires_in_days is null or expires_in_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stamp_progress (
  id uuid primary key default gen_random_uuid(),
  stamp_card_id uuid not null references public.stamp_cards(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  round integer not null default 1 check (round > 0),
  stamp_count integer not null default 0 check (stamp_count >= 0),
  status text not null default 'active' check (status in ('active','completed','reserved','redeemed','expired')),
  completed_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(stamp_card_id,user_id,round)
);

create table if not exists public.stamp_transactions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  stamp_card_id uuid not null references public.stamp_cards(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete set null,
  amount integer not null check (amount <> 0),
  type text not null check (type in ('earn','adjustment','reversal','expiration')),
  reference_id uuid,
  note text,
  idempotency_key uuid,
  created_at timestamptz not null default now()
);
create unique index if not exists stamp_transactions_idempotency_unique on public.stamp_transactions(program_id,idempotency_key) where idempotency_key is not null;

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '',
  image_url text,
  reward_type text not null check (reward_type in ('points','stamps','free','manual')),
  points_required bigint check (points_required is null or points_required > 0),
  stamps_required integer check (stamps_required is null or stamps_required > 0),
  stock integer check (stock is null or stock >= 0),
  max_per_user integer check (max_per_user is null or max_per_user > 0),
  start_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  points_transaction_id uuid references public.point_transactions(id) on delete restrict,
  stamp_progress_id uuid references public.stamp_progress(id) on delete restrict,
  reserved_points bigint not null default 0 check (reserved_points >= 0),
  status text not null default 'pending' check (status in ('pending','approved','completed','cancelled','expired')),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(program_id,idempotency_key)
);
