create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9_-]{3,32}$'),
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  discount_type text not null default 'perk' check (discount_type in ('perk','percent','fixed')),
  discount_value numeric(12,2),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  max_per_user integer not null default 1 check (max_per_user between 1 and 100),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(program_id,code),
  check ((discount_type='perk' and discount_value is null) or (discount_type='percent' and discount_value > 0 and discount_value <= 100) or (discount_type='fixed' and discount_value > 0)),
  check (expires_at is null or starts_at is null or expires_at > starts_at)
);

create index if not exists coupons_program_active_idx on public.coupons(program_id,active,expires_at);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'claimed' check (status in ('claimed','redeemed','cancelled','expired')),
  claimed_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions(coupon_id,status,claimed_at desc);
create index if not exists coupon_redemptions_user_idx on public.coupon_redemptions(user_id,program_id,claimed_at desc);

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

revoke all on public.coupons,public.coupon_redemptions from anon,authenticated;
grant select on public.coupons,public.coupon_redemptions to authenticated;
grant insert,update,delete on public.coupons to authenticated;
grant all on public.coupons,public.coupon_redemptions to service_role;

create policy "coupons visible or staff read" on public.coupons for select to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])) or (active and (starts_at is null or starts_at<=now()) and (expires_at is null or expires_at>now()) and exists(select 1 from public.programs p where p.id=program_id and p.status='active')));
create policy "coupons staff insert" on public.coupons for insert to authenticated
with check ((select private.is_program_staff(program_id,array['owner','admin','manager'])));
create policy "coupons staff update" on public.coupons for update to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager'])))
with check ((select private.is_program_staff(program_id,array['owner','admin','manager'])));
create policy "coupons staff delete" on public.coupons for delete to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager'])));
create policy "coupon redemptions owner or staff read" on public.coupon_redemptions for select to authenticated
using (user_id=(select auth.uid()) or (select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])));

create or replace function private.claim_coupon_impl(p_coupon_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid := (select auth.uid()); v_coupon public.coupons; v_total integer; v_user_total integer; v_redemption public.coupon_redemptions;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_coupon from public.coupons where id=p_coupon_id for update;
  if not found or not v_coupon.active then raise exception 'coupon unavailable'; end if;
  if v_coupon.starts_at is not null and v_coupon.starts_at>now() then raise exception 'coupon not started'; end if;
  if v_coupon.expires_at is not null and v_coupon.expires_at<=now() then raise exception 'coupon expired'; end if;
  if not exists(select 1 from public.program_members where program_id=v_coupon.program_id and user_id=v_uid and status='active') then raise exception 'active membership required'; end if;
  select count(*)::integer into v_total from public.coupon_redemptions where coupon_id=p_coupon_id and status in ('claimed','redeemed');
  if v_coupon.max_redemptions is not null and v_total>=v_coupon.max_redemptions then raise exception 'coupon allocation exhausted'; end if;
  select count(*)::integer into v_user_total from public.coupon_redemptions where coupon_id=p_coupon_id and user_id=v_uid and status in ('claimed','redeemed');
  if v_user_total>=v_coupon.max_per_user then raise exception 'coupon limit reached'; end if;
  insert into public.coupon_redemptions(coupon_id,program_id,user_id) values(v_coupon.id,v_coupon.program_id,v_uid) returning * into v_redemption;
  return jsonb_build_object('redemption_id',v_redemption.id,'status',v_redemption.status);
end;
$$;

create or replace function private.redeem_coupon_impl(p_redemption_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_redemption public.coupon_redemptions;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  select * into v_redemption from public.coupon_redemptions where id=p_redemption_id for update;
  if not found then raise exception 'coupon redemption not found'; end if;
  if not private.is_program_staff(v_redemption.program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  if v_redemption.status='redeemed' then return jsonb_build_object('redemption_id',v_redemption.id,'status','redeemed','replayed',true); end if;
  if v_redemption.status<>'claimed' then raise exception 'coupon is not claimable'; end if;
  update public.coupon_redemptions set status='redeemed',redeemed_at=now() where id=v_redemption.id;
  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state) values(v_redemption.program_id,(select auth.uid()),'redeem_coupon','coupon_redemption',v_redemption.id::text,jsonb_build_object('coupon_id',v_redemption.coupon_id,'user_id',v_redemption.user_id));
  return jsonb_build_object('redemption_id',v_redemption.id,'status','redeemed','replayed',false);
end;
$$;

create or replace function public.claim_coupon(p_coupon_id uuid)
returns jsonb language sql set search_path='' as $$ select private.claim_coupon_impl(p_coupon_id); $$;
create or replace function public.redeem_coupon(p_redemption_id uuid)
returns jsonb language sql set search_path='' as $$ select private.redeem_coupon_impl(p_redemption_id); $$;

revoke all on function private.claim_coupon_impl(uuid) from public,anon;
revoke all on function private.redeem_coupon_impl(uuid) from public,anon;
grant execute on function private.claim_coupon_impl(uuid) to authenticated;
grant execute on function private.redeem_coupon_impl(uuid) to authenticated;
revoke execute on function public.claim_coupon(uuid) from public,anon;
revoke execute on function public.redeem_coupon(uuid) from public,anon;
grant execute on function public.claim_coupon(uuid) to authenticated;
grant execute on function public.redeem_coupon(uuid) to authenticated;
