create or replace function public.join_program(p_program_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.join_program_impl(p_program_id); $$;
revoke all on function public.join_program(uuid) from public,anon;
grant execute on function public.join_program(uuid) to authenticated;

create or replace function private.issue_points_impl(p_program_id uuid,p_member_id uuid,p_amount bigint,p_note text,p_idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_balance bigint;
  v_tx uuid;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
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
revoke all on function private.issue_points_impl(uuid,uuid,bigint,text,uuid) from public,anon;
grant execute on function private.issue_points_impl(uuid,uuid,bigint,text,uuid) to authenticated;

create or replace function public.issue_points(p_program_id uuid,p_member_id uuid,p_amount bigint,p_note text default null,p_idempotency_key uuid default gen_random_uuid())
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.issue_points_impl(p_program_id,p_member_id,p_amount,p_note,p_idempotency_key); $$;
revoke all on function public.issue_points(uuid,uuid,bigint,text,uuid) from public,anon;
grant execute on function public.issue_points(uuid,uuid,bigint,text,uuid) to authenticated;

create or replace function private.issue_stamp_impl(p_program_id uuid,p_member_id uuid,p_amount integer,p_note text,p_idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_card public.stamp_cards;
  v_progress public.stamp_progress;
  v_tx uuid;
  v_new_count integer;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then raise exception 'not authorized'; end if;
  if not exists(select 1 from public.program_members where program_id=p_program_id and user_id=p_member_id and status='active') then raise exception 'member not active'; end if;
  select * into v_card from public.stamp_cards where program_id=p_program_id and active=true order by created_at limit 1;
  if not found then raise exception 'active stamp card not found'; end if;
  if p_amount > v_card.max_stamps_per_transaction then raise exception 'stamp transaction limit exceeded'; end if;
  select id into v_tx from public.stamp_transactions where program_id=p_program_id and idempotency_key=p_idempotency_key;
  if v_tx is not null then return jsonb_build_object('transaction_id',v_tx,'replayed',true); end if;
  select * into v_progress from public.stamp_progress where stamp_card_id=v_card.id and user_id=p_member_id and status='active' order by round desc limit 1 for update;
  if not found then
    insert into public.stamp_progress(stamp_card_id,program_id,user_id,round) values(v_card.id,p_program_id,p_member_id,1) returning * into v_progress;
  end if;
  v_new_count := least(v_progress.stamp_count + p_amount, v_card.required_stamps);
  update public.stamp_progress set stamp_count=v_new_count,status=case when v_new_count >= v_card.required_stamps then 'completed' else 'active' end,completed_at=case when v_new_count >= v_card.required_stamps then coalesce(completed_at,now()) else completed_at end,updated_at=now() where id=v_progress.id;
  insert into public.stamp_transactions(program_id,stamp_card_id,user_id,actor_id,amount,type,note,idempotency_key) values(p_program_id,v_card.id,p_member_id,v_actor,p_amount,'earn',p_note,p_idempotency_key) returning id into v_tx;
  update public.program_members set last_activity_at=now() where program_id=p_program_id and user_id=p_member_id;
  insert into public.notifications(user_id,type,title,message,metadata) values(p_member_id,'stamp_received','Stamp received',format('+%s stamp',p_amount),jsonb_build_object('program_id',p_program_id,'stamp_card_id',v_card.id,'completed',v_new_count>=v_card.required_stamps));
  return jsonb_build_object('transaction_id',v_tx,'stamp_count',v_new_count,'required_stamps',v_card.required_stamps,'completed',v_new_count>=v_card.required_stamps,'replayed',false);
end;
$$;
revoke all on function private.issue_stamp_impl(uuid,uuid,integer,text,uuid) from public,anon;
grant execute on function private.issue_stamp_impl(uuid,uuid,integer,text,uuid) to authenticated;

create or replace function public.issue_stamp(p_program_id uuid,p_member_id uuid,p_amount integer default 1,p_note text default null,p_idempotency_key uuid default gen_random_uuid())
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.issue_stamp_impl(p_program_id,p_member_id,p_amount,p_note,p_idempotency_key); $$;
revoke all on function public.issue_stamp(uuid,uuid,integer,text,uuid) from public,anon;
grant execute on function public.issue_stamp(uuid,uuid,integer,text,uuid) to authenticated;
