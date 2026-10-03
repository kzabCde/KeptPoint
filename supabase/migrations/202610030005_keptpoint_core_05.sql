create or replace function private.cancel_redemption_impl(p_redemption_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_redemption public.reward_redemptions;
  v_reward public.rewards;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  select * into v_redemption from public.reward_redemptions where id=p_redemption_id for update;
  if not found then raise exception 'redemption not found'; end if;
  if v_redemption.user_id<>v_actor and not private.is_program_staff(v_redemption.program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  if v_redemption.status='cancelled' then return jsonb_build_object('redemption_id',v_redemption.id,'status','cancelled','replayed',true); end if;
  if v_redemption.status <> 'pending' then raise exception 'redemption is not pending'; end if;
  if v_redemption.reserved_points>0 then
    update public.point_accounts set reserved_balance=reserved_balance-v_redemption.reserved_points,updated_at=now() where program_id=v_redemption.program_id and user_id=v_redemption.user_id and reserved_balance>=v_redemption.reserved_points;
  end if;
  if v_redemption.stamp_progress_id is not null then
    update public.stamp_progress set status='completed',updated_at=now() where id=v_redemption.stamp_progress_id and status='reserved';
  end if;
  select * into v_reward from public.rewards where id=v_redemption.reward_id for update;
  if v_reward.stock is not null then update public.rewards set stock=stock+1,updated_at=now() where id=v_reward.id; end if;
  update public.reward_redemptions set status='cancelled' where id=v_redemption.id;
  return jsonb_build_object('redemption_id',v_redemption.id,'status','cancelled','replayed',false);
end;
$$;
revoke all on function private.cancel_redemption_impl(uuid) from public,anon;
grant execute on function private.cancel_redemption_impl(uuid) to authenticated;

create or replace function public.cancel_redemption(p_redemption_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.cancel_redemption_impl(p_redemption_id); $$;
revoke all on function public.cancel_redemption(uuid) from public,anon;
grant execute on function public.cancel_redemption(uuid) to authenticated;

create or replace function private.create_qr_session_impl(p_program_id uuid,p_action text,p_payload jsonb,p_ttl_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_raw text := encode(gen_random_bytes(32),'hex');
  v_id uuid;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if p_ttl_seconds < 15 or p_ttl_seconds > 600 then raise exception 'ttl out of range'; end if;
  if p_action not in ('join','earn_points','earn_stamp','redeem_reward','transfer') then raise exception 'unsupported action'; end if;
  if p_action in ('earn_points','earn_stamp') and not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  insert into public.qr_sessions(token_hash,program_id,creator_id,action,payload,expires_at) values(encode(digest(v_raw,'sha256'),'hex'),p_program_id,v_uid,p_action,coalesce(p_payload,'{}'::jsonb),now()+make_interval(secs=>p_ttl_seconds)) returning id into v_id;
  return jsonb_build_object('session_id',v_id,'token',v_raw,'expires_in',p_ttl_seconds);
end;
$$;
revoke all on function private.create_qr_session_impl(uuid,text,jsonb,integer) from public,anon;
grant execute on function private.create_qr_session_impl(uuid,text,jsonb,integer) to authenticated;

create or replace function public.create_qr_session(p_program_id uuid,p_action text,p_payload jsonb default '{}'::jsonb,p_ttl_seconds integer default 90)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.create_qr_session_impl(p_program_id,p_action,p_payload,p_ttl_seconds); $$;
revoke all on function public.create_qr_session(uuid,text,jsonb,integer) from public,anon;
grant execute on function public.create_qr_session(uuid,text,jsonb,integer) to authenticated;
