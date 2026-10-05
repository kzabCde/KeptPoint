-- A browser retry gets the same idempotency key, but a reload or a second tab
-- can legitimately submit a different key. Serialize on the reward row and
-- reuse an outstanding redemption for the same user/reward before reserving
-- points, stamps, or stock a second time.

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
  v_existing_status text;
  v_reserved bigint := 0;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_reward from public.rewards where id=p_reward_id and active=true and (start_at is null or start_at<=now()) and (expires_at is null or expires_at>now()) for update;
  if not found then raise exception 'reward unavailable'; end if;
  if not exists(select 1 from public.program_members where program_id=v_reward.program_id and user_id=v_uid and status='active') then raise exception 'membership required'; end if;

  select id,status into v_redemption,v_existing_status
  from public.reward_redemptions
  where program_id=v_reward.program_id and idempotency_key=p_idempotency_key;
  if v_redemption is not null then
    return jsonb_build_object('redemption_id',v_redemption,'status',v_existing_status,'replayed',true);
  end if;

  select id,status into v_redemption,v_existing_status
  from public.reward_redemptions
  where reward_id=v_reward.id and user_id=v_uid and status in ('pending','approved')
  order by created_at desc
  limit 1;
  if v_redemption is not null then
    return jsonb_build_object('redemption_id',v_redemption,'status',v_existing_status,'replayed',true);
  end if;

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
