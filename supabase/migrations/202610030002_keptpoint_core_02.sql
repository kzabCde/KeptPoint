create table if not exists public.qr_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  program_id uuid references public.programs(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('join','earn_points','earn_stamp','redeem_reward','transfer')),
  payload jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active','used','expired','cancelled')),
  created_at timestamptz not null default now(),
  constraint qr_session_expiration_after_creation check (expires_at > created_at)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_not_self check (requester_id <> addressee_id),
  unique(requester_id,addressee_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('points_received','stamp_received','reward_available','reward_expiring','points_expiring','friend_request','campaign','redemption','security')),
  title text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft','active','paused','ended')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_rules (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  trigger_type text not null check (trigger_type in ('signup','first_visit','transaction','birthday','referral','date_range','manual')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  program_id uuid references public.programs(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists program_members_user_idx on public.program_members(user_id,status);
create index if not exists program_staff_user_idx on public.program_staff(user_id,program_id);
create index if not exists point_accounts_user_idx on public.point_accounts(user_id,program_id);
create index if not exists point_transactions_user_created_idx on public.point_transactions(user_id,created_at desc);
create index if not exists point_transactions_program_created_idx on public.point_transactions(program_id,created_at desc);
create index if not exists stamp_progress_user_idx on public.stamp_progress(user_id,program_id,status);
create index if not exists stamp_transactions_user_created_idx on public.stamp_transactions(user_id,created_at desc);
create index if not exists rewards_program_active_idx on public.rewards(program_id,active);
create index if not exists reward_redemptions_user_created_idx on public.reward_redemptions(user_id,created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);
create index if not exists qr_sessions_expiry_idx on public.qr_sessions(status,expires_at);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name, avatar_url)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.is_program_staff(p_program_id uuid, p_roles text[] default array['owner','admin','manager','cashier'])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.program_staff s
    where s.program_id = p_program_id
      and s.user_id = (select auth.uid())
      and s.role = any(p_roles)
  ) or exists(
    select 1 from public.programs p
    where p.id = p_program_id and p.owner_id = (select auth.uid())
  );
$$;
revoke all on function private.is_program_staff(uuid,text[]) from public;
grant execute on function private.is_program_staff(uuid,text[]) to authenticated;

create or replace function private.is_program_member(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.program_members m
    where m.program_id = p_program_id and m.user_id = (select auth.uid()) and m.status = 'active'
  );
$$;
revoke all on function private.is_program_member(uuid) from public;
grant execute on function private.is_program_member(uuid) to authenticated;

create or replace function private.after_program_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.program_staff(program_id,user_id,role) values(new.id,new.owner_id,'owner') on conflict do nothing;
  insert into public.program_members(program_id,user_id,status) values(new.id,new.owner_id,'active') on conflict do nothing;
  insert into public.point_accounts(program_id,user_id) values(new.id,new.owner_id) on conflict do nothing;
  return new;
end;
$$;
revoke all on function private.after_program_insert() from public,anon,authenticated;

drop trigger if exists programs_after_insert on public.programs;
create trigger programs_after_insert after insert on public.programs for each row execute function private.after_program_insert();

create or replace function private.join_program_impl(p_program_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_program public.programs;
  v_status text;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_program from public.programs where id = p_program_id and status = 'active';
  if not found then raise exception 'program unavailable'; end if;
  if v_program.join_mode = 'invite_only' or v_program.visibility = 'invite_only' then raise exception 'invite required'; end if;
  v_status := case when v_program.join_mode = 'approval' then 'pending' else 'active' end;
  insert into public.program_members(program_id,user_id,status) values(p_program_id,v_uid,v_status)
  on conflict(program_id,user_id) do update set status = excluded.status where public.program_members.status in ('left','pending');
  insert into public.point_accounts(program_id,user_id) values(p_program_id,v_uid) on conflict do nothing;
  return jsonb_build_object('program_id',p_program_id,'status',v_status);
end;
$$;
revoke all on function private.join_program_impl(uuid) from public,anon;
grant execute on function private.join_program_impl(uuid) to authenticated;
