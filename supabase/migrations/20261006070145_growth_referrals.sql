create table if not exists public.program_referral_settings (
  program_id uuid primary key references public.programs(id) on delete cascade,
  enabled boolean not null default false,
  referrer_bonus bigint not null default 50 check (referrer_bonus between 0 and 1000000),
  referred_bonus bigint not null default 50 check (referred_bonus between 0 and 1000000),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{8,16}$'),
  created_at timestamptz not null default now(),
  unique(program_id,user_id)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  referral_code_id uuid not null references public.referral_codes(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','rewarded','cancelled')),
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  check (referrer_id <> referred_id),
  unique(program_id,referred_id)
);

create index if not exists referrals_referrer_idx on public.referrals(program_id,referrer_id,created_at desc);
create index if not exists referrals_status_idx on public.referrals(program_id,status,created_at desc);

alter table public.program_referral_settings enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;

revoke all on public.program_referral_settings, public.referral_codes, public.referrals from anon, authenticated;
grant select on public.program_referral_settings, public.referral_codes, public.referrals to authenticated;
grant insert,update on public.program_referral_settings to authenticated;
grant all on public.program_referral_settings, public.referral_codes, public.referrals to service_role;

create policy "referral settings readable" on public.program_referral_settings for select to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])) or exists(select 1 from public.programs p where p.id=program_id and p.status='active'));
create policy "referral settings staff insert" on public.program_referral_settings for insert to authenticated
with check ((select private.is_program_staff(program_id,array['owner','admin','manager'])));
create policy "referral settings staff update" on public.program_referral_settings for update to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager'])))
with check ((select private.is_program_staff(program_id,array['owner','admin','manager'])));
create policy "referral codes owner or staff read" on public.referral_codes for select to authenticated
using (user_id=(select auth.uid()) or (select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])));
create policy "referrals participants or staff read" on public.referrals for select to authenticated
using (referrer_id=(select auth.uid()) or referred_id=(select auth.uid()) or (select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])));

create or replace function private.get_or_create_referral_code_impl(p_program_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid := (select auth.uid()); v_row public.referral_codes; v_code text;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from public.program_members where program_id=p_program_id and user_id=v_uid and status='active') then raise exception 'active membership required'; end if;
  if not exists(select 1 from public.program_referral_settings where program_id=p_program_id and enabled=true) then raise exception 'referrals are disabled'; end if;
  select * into v_row from public.referral_codes where program_id=p_program_id and user_id=v_uid;
  if found then return jsonb_build_object('id',v_row.id,'code',v_row.code,'created',false); end if;
  loop
    v_code := upper(substr(pg_catalog.encode(extensions.gen_random_bytes(8),'hex'),1,10));
    begin
      insert into public.referral_codes(program_id,user_id,code) values(p_program_id,v_uid,v_code) returning * into v_row;
      exit;
    exception when unique_violation then
      select * into v_row from public.referral_codes where program_id=p_program_id and user_id=v_uid;
      if found then exit; end if;
    end;
  end loop;
  return jsonb_build_object('id',v_row.id,'code',v_row.code,'created',true);
end;
$$;

create or replace function private.claim_referral_impl(p_program_id uuid,p_code text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid := (select auth.uid()); v_code public.referral_codes; v_ref public.referrals;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from public.program_members where program_id=p_program_id and user_id=v_uid and status='active') then raise exception 'active membership required'; end if;
  if not exists(select 1 from public.program_referral_settings where program_id=p_program_id and enabled=true) then raise exception 'referrals are disabled'; end if;
  if exists(select 1 from public.point_transactions where program_id=p_program_id and user_id=v_uid and type='earn' and source in ('manual','qr','purchase') and amount>0) then raise exception 'referral must be claimed before first earning activity'; end if;
  select * into v_code from public.referral_codes where program_id=p_program_id and code=upper(trim(p_code));
  if not found then raise exception 'invalid referral code'; end if;
  if v_code.user_id=v_uid then raise exception 'cannot refer yourself'; end if;
  insert into public.referrals(program_id,referrer_id,referred_id,referral_code_id) values(p_program_id,v_code.user_id,v_uid,v_code.id) on conflict(program_id,referred_id) do nothing;
  select * into v_ref from public.referrals where program_id=p_program_id and referred_id=v_uid;
  if v_ref.referrer_id<>v_code.user_id then raise exception 'referral already claimed'; end if;
  return jsonb_build_object('referral_id',v_ref.id,'status',v_ref.status);
end;
$$;

create or replace function private.reward_referral_after_earn()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_ref public.referrals; v_settings public.program_referral_settings;
begin
  select * into v_ref from public.referrals where program_id=new.program_id and referred_id=new.user_id for update;
  if not found or v_ref.status<>'pending' then return new; end if;
  select * into v_settings from public.program_referral_settings where program_id=new.program_id and enabled=true;
  if not found then return new; end if;
  update public.referrals set status='rewarded',rewarded_at=now() where id=v_ref.id;
  insert into public.point_accounts(program_id,user_id) values(new.program_id,v_ref.referrer_id),(new.program_id,v_ref.referred_id) on conflict do nothing;
  if v_settings.referrer_bonus>0 then
    update public.point_accounts set balance=balance+v_settings.referrer_bonus,lifetime_earned=lifetime_earned+v_settings.referrer_bonus,last_activity_at=now(),updated_at=now() where program_id=new.program_id and user_id=v_ref.referrer_id;
    insert into public.point_transactions(program_id,user_id,actor_id,amount,type,source,reference_id,note,metadata) values(new.program_id,v_ref.referrer_id,null,v_settings.referrer_bonus,'bonus','campaign',v_ref.id,'Referral bonus',jsonb_build_object('kind','referral','referral_id',v_ref.id,'side','referrer'));
    insert into public.notifications(user_id,type,title,message,metadata) values(v_ref.referrer_id,'points_received','Referral bonus',format('+%s points',v_settings.referrer_bonus),jsonb_build_object('program_id',new.program_id,'referral_id',v_ref.id));
  end if;
  if v_settings.referred_bonus>0 then
    update public.point_accounts set balance=balance+v_settings.referred_bonus,lifetime_earned=lifetime_earned+v_settings.referred_bonus,last_activity_at=now(),updated_at=now() where program_id=new.program_id and user_id=v_ref.referred_id;
    insert into public.point_transactions(program_id,user_id,actor_id,amount,type,source,reference_id,note,metadata) values(new.program_id,v_ref.referred_id,null,v_settings.referred_bonus,'bonus','campaign',v_ref.id,'Referral welcome bonus',jsonb_build_object('kind','referral','referral_id',v_ref.id,'side','referred'));
    insert into public.notifications(user_id,type,title,message,metadata) values(v_ref.referred_id,'points_received','Referral bonus',format('+%s points',v_settings.referred_bonus),jsonb_build_object('program_id',new.program_id,'referral_id',v_ref.id));
  end if;
  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state) values(new.program_id,null,'reward_referral','referral',v_ref.id::text,jsonb_build_object('referrer_id',v_ref.referrer_id,'referred_id',v_ref.referred_id,'referrer_bonus',v_settings.referrer_bonus,'referred_bonus',v_settings.referred_bonus));
  return new;
end;
$$;

create trigger reward_referral_after_earn after insert on public.point_transactions
for each row when (new.type='earn' and new.amount>0 and new.source in ('manual','qr','purchase'))
execute function private.reward_referral_after_earn();

create or replace function public.get_or_create_referral_code(p_program_id uuid)
returns jsonb language sql set search_path='' as $$ select private.get_or_create_referral_code_impl(p_program_id); $$;
create or replace function public.claim_referral(p_program_id uuid,p_code text)
returns jsonb language sql set search_path='' as $$ select private.claim_referral_impl(p_program_id,p_code); $$;

revoke all on function private.get_or_create_referral_code_impl(uuid) from public,anon;
revoke all on function private.claim_referral_impl(uuid,text) from public,anon;
grant execute on function private.get_or_create_referral_code_impl(uuid) to authenticated;
grant execute on function private.claim_referral_impl(uuid,text) to authenticated;
revoke execute on function public.get_or_create_referral_code(uuid) from public,anon;
revoke execute on function public.claim_referral(uuid,text) from public,anon;
grant execute on function public.get_or_create_referral_code(uuid) to authenticated;
grant execute on function public.claim_referral(uuid,text) to authenticated;
