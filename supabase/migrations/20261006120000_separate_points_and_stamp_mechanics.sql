alter table public.programs
  add column if not exists point_redemption_enabled boolean not null default true,
  add column if not exists point_tier_enabled boolean not null default false;

update public.programs
set point_redemption_enabled = false,
    point_tier_enabled = false
where program_type = 'stamps';

alter table public.programs drop constraint if exists programs_point_mechanics_check;
alter table public.programs add constraint programs_point_mechanics_check check (
  program_type <> 'stamps' or (point_redemption_enabled = false and point_tier_enabled = false)
);

alter table public.rewards
  add column if not exists stamp_card_id uuid references public.stamp_cards(id) on delete cascade;

create unique index if not exists rewards_one_stamp_reward_per_card_idx
  on public.rewards(stamp_card_id)
  where stamp_card_id is not null;

alter table public.rewards drop constraint if exists rewards_loyalty_mechanic_check;
alter table public.rewards add constraint rewards_loyalty_mechanic_check check (
  (reward_type = 'points' and points_required is not null and points_required > 0 and stamps_required is null and stamp_card_id is null)
  or
  (reward_type = 'stamps' and stamps_required is not null and stamps_required > 0 and stamp_card_id is not null and points_required is null)
  or
  (reward_type in ('free','manual') and points_required is null and stamps_required is null and stamp_card_id is null)
);

create or replace function private.issue_points_impl(p_program_id uuid, p_member_id uuid, p_amount bigint, p_note text, p_idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_program public.programs;
  v_balance bigint;
  v_tx uuid;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  select * into v_program from public.programs where id=p_program_id and status='active';
  if not found then raise exception 'program not found or inactive'; end if;
  if v_program.program_type not in ('points','hybrid') or not (v_program.point_redemption_enabled or v_program.point_tier_enabled) then raise exception 'points are not enabled for this program'; end if;
  if not exists(select 1 from public.program_members where program_id=p_program_id and user_id=p_member_id and status='active') then raise exception 'member not active'; end if;
  select id into v_tx from public.point_transactions where program_id=p_program_id and idempotency_key=p_idempotency_key;
  if v_tx is not null then
    select balance into v_balance from public.point_accounts where program_id=p_program_id and user_id=p_member_id;
    return jsonb_build_object('transaction_id',v_tx,'balance',v_balance,'replayed',true);
  end if;
  insert into public.point_accounts(program_id,user_id) values(p_program_id,p_member_id) on conflict do nothing;
  select balance into v_balance from public.point_accounts where program_id=p_program_id and user_id=p_member_id for update;
  insert into public.point_transactions(program_id,user_id,actor_id,amount,type,source,note,idempotency_key)
  values(p_program_id,p_member_id,v_actor,p_amount,'earn','manual',p_note,p_idempotency_key) returning id into v_tx;
  update public.point_accounts set balance=balance+p_amount,lifetime_earned=lifetime_earned+p_amount,last_activity_at=now(),updated_at=now() where program_id=p_program_id and user_id=p_member_id returning balance into v_balance;
  update public.program_members set last_activity_at=now() where program_id=p_program_id and user_id=p_member_id;
  insert into public.notifications(user_id,type,title,message,metadata) values(p_member_id,'points_received','Points received',format('+%s points',p_amount),jsonb_build_object('program_id',p_program_id,'transaction_id',v_tx));
  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state) values(p_program_id,v_actor,'issue_points','point_transaction',v_tx::text,jsonb_build_object('user_id',p_member_id,'amount',p_amount));
  return jsonb_build_object('transaction_id',v_tx,'balance',v_balance,'replayed',false);
end;
$$;

create or replace function private.issue_stamp_impl(p_program_id uuid, p_member_id uuid, p_amount integer, p_note text, p_idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_program_type text;
  v_card public.stamp_cards;
  v_progress public.stamp_progress;
  v_tx uuid;
  v_new_count integer;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  select program_type into v_program_type from public.programs where id=p_program_id and status='active';
  if not found then raise exception 'program not found or inactive'; end if;
  if v_program_type not in ('stamps','hybrid') then raise exception 'stamp cards are not enabled for this program'; end if;
  if not exists(select 1 from public.program_members where program_id=p_program_id and user_id=p_member_id and status='active') then raise exception 'member not active'; end if;
  select * into v_card from public.stamp_cards where program_id=p_program_id and active=true order by created_at limit 1;
  if not found then raise exception 'active stamp card not found'; end if;
  if p_amount > v_card.max_stamps_per_transaction then raise exception 'stamp transaction limit exceeded'; end if;
  select id into v_tx from public.stamp_transactions where program_id=p_program_id and idempotency_key=p_idempotency_key;
  if v_tx is not null then return jsonb_build_object('transaction_id',v_tx,'replayed',true); end if;
  select * into v_progress from public.stamp_progress where stamp_card_id=v_card.id and user_id=p_member_id and status='active' order by round desc limit 1 for update;
  if not found then insert into public.stamp_progress(stamp_card_id,program_id,user_id,round) values(v_card.id,p_program_id,p_member_id,1) returning * into v_progress; end if;
  v_new_count := least(v_progress.stamp_count + p_amount, v_card.required_stamps);
  update public.stamp_progress set stamp_count=v_new_count,status=case when v_new_count >= v_card.required_stamps then 'completed' else 'active' end,completed_at=case when v_new_count >= v_card.required_stamps then coalesce(completed_at,now()) else completed_at end,updated_at=now() where id=v_progress.id;
  insert into public.stamp_transactions(program_id,stamp_card_id,user_id,actor_id,amount,type,note,idempotency_key) values(p_program_id,v_card.id,p_member_id,v_actor,p_amount,'earn',p_note,p_idempotency_key) returning id into v_tx;
  update public.program_members set last_activity_at=now() where program_id=p_program_id and user_id=p_member_id;
  insert into public.notifications(user_id,type,title,message,metadata) values(p_member_id,'stamp_received','Stamp received',format('+%s stamp',p_amount),jsonb_build_object('program_id',p_program_id,'stamp_card_id',v_card.id,'completed',v_new_count>=v_card.required_stamps));
  return jsonb_build_object('transaction_id',v_tx,'stamp_count',v_new_count,'required_stamps',v_card.required_stamps,'completed',v_new_count>=v_card.required_stamps,'replayed',false);
end;
$$;

create or replace function private.redeem_reward_impl(p_reward_id uuid, p_idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reward public.rewards;
  v_program public.programs;
  v_account public.point_accounts;
  v_progress public.stamp_progress;
  v_redemption uuid;
  v_reserved bigint := 0;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_reward from public.rewards where id=p_reward_id and active=true and (start_at is null or start_at<=now()) and (expires_at is null or expires_at>now()) for update;
  if not found then raise exception 'reward unavailable'; end if;
  select * into v_program from public.programs where id=v_reward.program_id and status='active';
  if not found then raise exception 'program unavailable'; end if;
  if not exists(select 1 from public.program_members where program_id=v_reward.program_id and user_id=v_uid and status='active') then raise exception 'membership required'; end if;
  select id into v_redemption from public.reward_redemptions where program_id=v_reward.program_id and idempotency_key=p_idempotency_key;
  if v_redemption is not null then return jsonb_build_object('redemption_id',v_redemption,'replayed',true); end if;
  if v_reward.stock is not null and v_reward.stock <= 0 then raise exception 'reward sold out'; end if;
  if v_reward.max_per_user is not null and (select count(*) from public.reward_redemptions where reward_id=v_reward.id and user_id=v_uid and status in ('pending','approved','completed')) >= v_reward.max_per_user then raise exception 'redemption limit reached'; end if;
  if v_reward.reward_type='points' then
    if v_program.program_type not in ('points','hybrid') or not v_program.point_redemption_enabled then raise exception 'point redemption is disabled'; end if;
    select * into v_account from public.point_accounts where program_id=v_reward.program_id and user_id=v_uid for update;
    if not found or (v_account.balance - v_account.reserved_balance) < coalesce(v_reward.points_required,0) then raise exception 'insufficient available points'; end if;
    v_reserved := v_reward.points_required;
    update public.point_accounts set reserved_balance=reserved_balance+v_reserved,updated_at=now() where id=v_account.id;
  elsif v_reward.reward_type='stamps' then
    if v_program.program_type not in ('stamps','hybrid') then raise exception 'stamp cards are disabled'; end if;
    if v_reward.stamp_card_id is null then raise exception 'stamp reward is not linked to a stamp card'; end if;
    select sp.* into v_progress from public.stamp_progress sp where sp.program_id=v_reward.program_id and sp.stamp_card_id=v_reward.stamp_card_id and sp.user_id=v_uid and sp.status='completed' and sp.stamp_count>=coalesce(v_reward.stamps_required,0) order by sp.completed_at asc nulls last limit 1 for update of sp;
    if not found then raise exception 'completed stamp card required'; end if;
    update public.stamp_progress set status='reserved',updated_at=now() where id=v_progress.id;
  end if;
  if v_reward.stock is not null then update public.rewards set stock=stock-1,updated_at=now() where id=v_reward.id; end if;
  insert into public.reward_redemptions(reward_id,program_id,user_id,stamp_progress_id,reserved_points,status,idempotency_key) values(v_reward.id,v_reward.program_id,v_uid,v_progress.id,v_reserved,'pending',p_idempotency_key) returning id into v_redemption;
  insert into public.notifications(user_id,type,title,message,metadata) values(v_uid,'redemption','Reward ready to verify',v_reward.name,jsonb_build_object('program_id',v_reward.program_id,'reward_id',v_reward.id,'redemption_id',v_redemption));
  return jsonb_build_object('redemption_id',v_redemption,'status','pending','reserved_points',v_reserved,'replayed',false);
end;
$$;
