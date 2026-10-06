create or replace function private.guard_point_transaction_mechanic()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_program public.programs;
begin
  select * into v_program from public.programs where id = new.program_id;
  if not found then raise exception 'program not found'; end if;
  if v_program.program_type not in ('points','hybrid')
     or not (v_program.point_redemption_enabled or v_program.point_tier_enabled) then
    raise exception 'points are disabled for this program';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_point_transaction_mechanic_trigger on public.point_transactions;
create trigger guard_point_transaction_mechanic_trigger
before insert on public.point_transactions
for each row execute function private.guard_point_transaction_mechanic();

create or replace function private.guard_reward_mechanic()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_program public.programs;
  v_card public.stamp_cards;
begin
  select * into v_program from public.programs where id = new.program_id;
  if not found then raise exception 'program not found'; end if;

  if new.reward_type = 'points' then
    if v_program.program_type not in ('points','hybrid') or not v_program.point_redemption_enabled then
      raise exception 'point redemption is disabled for this program';
    end if;
  elsif new.reward_type = 'stamps' then
    if v_program.program_type not in ('stamps','hybrid') then
      raise exception 'stamp cards are disabled for this program';
    end if;
    select * into v_card from public.stamp_cards where id = new.stamp_card_id and program_id = new.program_id;
    if not found then raise exception 'stamp reward must reference a stamp card from the same program'; end if;
    if new.stamps_required <> v_card.required_stamps then
      raise exception 'stamp reward requirement must equal the stamp card completion requirement';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_reward_mechanic_trigger on public.rewards;
create trigger guard_reward_mechanic_trigger
before insert or update of program_id,reward_type,points_required,stamps_required,stamp_card_id on public.rewards
for each row execute function private.guard_reward_mechanic();

create or replace function private.guard_referral_point_bonus()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_program public.programs;
begin
  if not new.enabled then return new; end if;
  select * into v_program from public.programs where id = new.program_id;
  if not found then raise exception 'program not found'; end if;
  if v_program.program_type not in ('points','hybrid')
     or not (v_program.point_redemption_enabled or v_program.point_tier_enabled) then
    raise exception 'point-based referrals require points to be enabled';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_referral_point_bonus_trigger on public.program_referral_settings;
create trigger guard_referral_point_bonus_trigger
before insert or update of enabled,program_id on public.program_referral_settings
for each row execute function private.guard_referral_point_bonus();

create or replace function private.sync_program_mechanic_dependents()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.point_tier_enabled = false or new.program_type not in ('points','hybrid') then
    update public.program_tiers set active=false,updated_at=now()
    where program_id=new.id and active=true;
  end if;

  if new.program_type not in ('points','hybrid')
     or not (new.point_redemption_enabled or new.point_tier_enabled) then
    update public.program_referral_settings set enabled=false,updated_at=now()
    where program_id=new.id and enabled=true;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_program_mechanic_dependents_trigger on public.programs;
create trigger sync_program_mechanic_dependents_trigger
after update of program_type,point_redemption_enabled,point_tier_enabled on public.programs
for each row execute function private.sync_program_mechanic_dependents();

update public.program_referral_settings s
set enabled=false,updated_at=now()
where enabled=true and not exists (
  select 1 from public.programs p
  where p.id=s.program_id
    and p.program_type in ('points','hybrid')
    and (p.point_redemption_enabled or p.point_tier_enabled)
);

create or replace function private.create_qr_session_impl(p_program_id uuid, p_action text, p_payload jsonb, p_ttl_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_program public.programs;
  v_card public.stamp_cards;
  v_amount bigint;
  v_raw text := pg_catalog.encode(extensions.gen_random_bytes(32),'hex');
  v_id uuid;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if p_program_id is null then raise exception 'program required'; end if;
  if p_action not in ('join','earn_points','earn_stamp','redeem_reward','transfer') then raise exception 'unsupported action'; end if;
  if p_ttl_seconds < 15 then raise exception 'ttl out of range'; end if;
  if p_action = 'join' then
    if p_ttl_seconds > 3600 then raise exception 'ttl out of range'; end if;
  elsif p_ttl_seconds > 600 then
    raise exception 'ttl out of range';
  end if;

  select * into v_program from public.programs where id = p_program_id and status = 'active';
  if not found then raise exception 'program unavailable'; end if;

  if p_action in ('join','earn_points','earn_stamp')
     and not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then
    raise exception 'not authorized';
  end if;

  if p_action = 'earn_points' then
    if v_program.program_type not in ('points','hybrid')
       or not (v_program.point_redemption_enabled or v_program.point_tier_enabled) then
      raise exception 'points are disabled for this program';
    end if;
    begin
      v_amount := (p_payload->>'amount')::bigint;
    exception when others then
      raise exception 'invalid qr amount';
    end;
    if v_amount is null or v_amount < 1 or v_amount > 1000000 then raise exception 'invalid qr amount'; end if;
  elsif p_action = 'earn_stamp' then
    if v_program.program_type not in ('stamps','hybrid') then raise exception 'stamps not supported by program'; end if;
    select * into v_card from public.stamp_cards where program_id = p_program_id and active = true order by created_at limit 1;
    if not found then raise exception 'active stamp card not found'; end if;
    begin
      v_amount := coalesce((p_payload->>'amount')::bigint,1);
    exception when others then
      raise exception 'invalid qr amount';
    end;
    if v_amount < 1 or v_amount > v_card.max_stamps_per_transaction then raise exception 'invalid stamp amount'; end if;
  end if;

  insert into public.qr_sessions(token_hash,program_id,creator_id,action,payload,expires_at)
  values(pg_catalog.encode(extensions.digest(v_raw,'sha256'),'hex'),p_program_id,v_uid,p_action,coalesce(p_payload,'{}'::jsonb),now()+make_interval(secs=>p_ttl_seconds))
  returning id into v_id;

  return jsonb_build_object('session_id',v_id,'token',v_raw,'expires_in',p_ttl_seconds);
end;
$$;
