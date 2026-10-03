create or replace function private.redeem_reward_impl(p_reward_id uuid,p_idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reward public.rewards;
  v_account public.point_accounts;
  v_progress public.stamp_progress;
  v_redemption uuid;
  v_reserved bigint := 0;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_reward from public.rewards where id=p_reward_id and active=true and (start_at is null or start_at<=now()) and (expires_at is null or expires_at>now()) for update;
  if not found then raise exception 'reward unavailable'; end if;
  if not exists(select 1 from public.program_members where program_id=v_reward.program_id and user_id=v_uid and status='active') then raise exception 'membership required'; end if;
  select id into v_redemption from public.reward_redemptions where program_id=v_reward.program_id and idempotency_key=p_idempotency_key;
  if v_redemption is not null then return jsonb_build_object('redemption_id',v_redemption,'replayed',true); end if;
  if v_reward.stock is not null and v_reward.stock <= 0 then raise exception 'reward sold out'; end if;
  if v_reward.max_per_user is not null and (select count(*) from public.reward_redemptions where reward_id=v_reward.id and user_id=v_uid and status in ('pending','approved','completed')) >= v_reward.max_per_user then raise exception 'redemption limit reached'; end if;
  if v_reward.reward_type='points' then
    select * into v_account from public.point_accounts where program_id=v_reward.program_id and user_id=v_uid for update;
    if not found or (v_account.balance - v_account.reserved_balance) < coalesce(v_reward.points_required,0) then raise exception 'insufficient available points'; end if;
    v_reserved := v_reward.points_required;
    update public.point_accounts set reserved_balance=reserved_balance+v_reserved,updated_at=now() where id=v_account.id;
  elsif v_reward.reward_type='stamps' then
    select sp.* into v_progress from public.stamp_progress sp join public.stamp_cards sc on sc.id=sp.stamp_card_id where sp.program_id=v_reward.program_id and sp.user_id=v_uid and sp.status='completed' and (v_reward.stamps_required is null or sp.stamp_count>=v_reward.stamps_required) order by sp.completed_at asc nulls last limit 1 for update of sp;
    if not found then raise exception 'completed stamp card required'; end if;
    update public.stamp_progress set status='reserved',updated_at=now() where id=v_progress.id;
  end if;
  if v_reward.stock is not null then update public.rewards set stock=stock-1,updated_at=now() where id=v_reward.id; end if;
  insert into public.reward_redemptions(reward_id,program_id,user_id,stamp_progress_id,reserved_points,status,idempotency_key) values(v_reward.id,v_reward.program_id,v_uid,v_progress.id,v_reserved,'pending',p_idempotency_key) returning id into v_redemption;
  insert into public.notifications(user_id,type,title,message,metadata) values(v_uid,'redemption','Reward ready to verify',v_reward.name,jsonb_build_object('program_id',v_reward.program_id,'reward_id',v_reward.id,'redemption_id',v_redemption));
  return jsonb_build_object('redemption_id',v_redemption,'status','pending','reserved_points',v_reserved,'replayed',false);
end;
$$;
revoke all on function private.redeem_reward_impl(uuid,uuid) from public,anon;
grant execute on function private.redeem_reward_impl(uuid,uuid) to authenticated;

create or replace function public.redeem_reward(p_reward_id uuid,p_idempotency_key uuid default gen_random_uuid())
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.redeem_reward_impl(p_reward_id,p_idempotency_key); $$;
revoke all on function public.redeem_reward(uuid,uuid) from public,anon;
grant execute on function public.redeem_reward(uuid,uuid) to authenticated;

create or replace function private.complete_redemption_impl(p_redemption_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_redemption public.reward_redemptions;
  v_reward public.rewards;
  v_account public.point_accounts;
  v_progress public.stamp_progress;
  v_card public.stamp_cards;
  v_tx uuid;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  select * into v_redemption from public.reward_redemptions where id=p_redemption_id for update;
  if not found then raise exception 'redemption not found'; end if;
  if not private.is_program_staff(v_redemption.program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  if v_redemption.status='completed' then return jsonb_build_object('redemption_id',v_redemption.id,'status','completed','replayed',true); end if;
  if v_redemption.status <> 'pending' then raise exception 'redemption is not pending'; end if;
  select * into v_reward from public.rewards where id=v_redemption.reward_id;
  if v_redemption.reserved_points > 0 then
    select * into v_account from public.point_accounts where program_id=v_redemption.program_id and user_id=v_redemption.user_id for update;
    if not found or v_account.reserved_balance < v_redemption.reserved_points or v_account.balance < v_redemption.reserved_points then raise exception 'reserved balance invalid'; end if;
    insert into public.point_transactions(program_id,user_id,actor_id,amount,type,source,reference_id,idempotency_key)
    values(v_redemption.program_id,v_redemption.user_id,v_actor,-v_redemption.reserved_points,'redeem','reward',v_reward.id,v_redemption.id) returning id into v_tx;
    update public.point_accounts set balance=balance-v_redemption.reserved_points,reserved_balance=reserved_balance-v_redemption.reserved_points,lifetime_redeemed=lifetime_redeemed+v_redemption.reserved_points,last_activity_at=now(),updated_at=now() where id=v_account.id;
  elsif v_reward.reward_type='stamps' then
    select sp, sc into v_progress, v_card from public.stamp_progress sp join public.stamp_cards sc on sc.id=sp.stamp_card_id where sp.id=v_redemption.stamp_progress_id and sp.user_id=v_redemption.user_id and sp.status='reserved' for update of sp;
    if not found then raise exception 'reserved stamp card no longer available'; end if;
    update public.stamp_progress set status='redeemed',redeemed_at=now(),updated_at=now() where id=v_progress.id;
    if v_card.reset_behavior in ('new_round','reset_same') then
      insert into public.stamp_progress(stamp_card_id,program_id,user_id,round) values(v_card.id,v_redemption.program_id,v_redemption.user_id,v_progress.round+1) on conflict do nothing;
    end if;
  end if;
  update public.reward_redemptions set status='completed',points_transaction_id=v_tx,completed_at=now() where id=v_redemption.id;
  insert into public.notifications(user_id,type,title,message,metadata) values(v_redemption.user_id,'redemption','Reward redeemed',v_reward.name,jsonb_build_object('program_id',v_redemption.program_id,'redemption_id',v_redemption.id));
  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state) values(v_redemption.program_id,v_actor,'complete_redemption','reward_redemption',v_redemption.id::text,jsonb_build_object('user_id',v_redemption.user_id,'reward_id',v_reward.id));
  return jsonb_build_object('redemption_id',v_redemption.id,'status','completed','transaction_id',v_tx,'replayed',false);
end;
$$;
revoke all on function private.complete_redemption_impl(uuid) from public,anon;
grant execute on function private.complete_redemption_impl(uuid) to authenticated;

create or replace function public.complete_redemption(p_redemption_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.complete_redemption_impl(p_redemption_id); $$;
revoke all on function public.complete_redemption(uuid) from public,anon;
grant execute on function public.complete_redemption(uuid) to authenticated;
