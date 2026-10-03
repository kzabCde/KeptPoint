create or replace function private.accept_qr_session_impl(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_session public.qr_sessions;
  v_result jsonb;
  v_amount bigint;
  v_balance bigint;
  v_tx uuid;
  v_card public.stamp_cards;
  v_progress public.stamp_progress;
  v_stamp_amount integer;
  v_new_count integer;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_session from public.qr_sessions where token_hash=encode(digest(p_token,'sha256'),'hex') for update;
  if not found then raise exception 'invalid qr'; end if;
  if v_session.status <> 'active' or v_session.used_at is not null then raise exception 'qr already used'; end if;
  if v_session.expires_at <= now() then update public.qr_sessions set status='expired' where id=v_session.id; raise exception 'qr expired'; end if;
  if v_session.creator_id = v_uid then raise exception 'cannot accept own qr'; end if;
  if v_session.action='join' then
    v_result := private.join_program_impl(v_session.program_id);
  elsif v_session.action='earn_points' then
    if not exists(select 1 from public.program_staff where program_id=v_session.program_id and user_id=v_session.creator_id and role in ('owner','admin','manager','cashier')) and not exists(select 1 from public.programs where id=v_session.program_id and owner_id=v_session.creator_id) then raise exception 'qr creator is not authorized'; end if;
    if not exists(select 1 from public.program_members where program_id=v_session.program_id and user_id=v_uid and status='active') then raise exception 'member not active'; end if;
    v_amount := (v_session.payload->>'amount')::bigint;
    if v_amount is null or v_amount<=0 then raise exception 'invalid qr amount'; end if;
    insert into public.point_accounts(program_id,user_id) values(v_session.program_id,v_uid) on conflict do nothing;
    select balance into v_balance from public.point_accounts where program_id=v_session.program_id and user_id=v_uid for update;
    insert into public.point_transactions(program_id,user_id,actor_id,amount,type,source,note,idempotency_key) values(v_session.program_id,v_uid,v_session.creator_id,v_amount,'earn','qr',v_session.payload->>'note',v_session.id) returning id into v_tx;
    update public.point_accounts set balance=balance+v_amount,lifetime_earned=lifetime_earned+v_amount,last_activity_at=now(),updated_at=now() where program_id=v_session.program_id and user_id=v_uid returning balance into v_balance;
    insert into public.notifications(user_id,type,title,message,metadata) values(v_uid,'points_received','Points received',format('+%s points',v_amount),jsonb_build_object('program_id',v_session.program_id,'transaction_id',v_tx));
    v_result := jsonb_build_object('transaction_id',v_tx,'balance',v_balance);
  elsif v_session.action='earn_stamp' then
    if not exists(select 1 from public.program_staff where program_id=v_session.program_id and user_id=v_session.creator_id and role in ('owner','admin','manager','cashier')) and not exists(select 1 from public.programs where id=v_session.program_id and owner_id=v_session.creator_id) then raise exception 'qr creator is not authorized'; end if;
    if not exists(select 1 from public.program_members where program_id=v_session.program_id and user_id=v_uid and status='active') then raise exception 'member not active'; end if;
    select * into v_card from public.stamp_cards where program_id=v_session.program_id and active=true order by created_at limit 1;
    if not found then raise exception 'active stamp card not found'; end if;
    v_stamp_amount := coalesce((v_session.payload->>'amount')::integer,1);
    if v_stamp_amount<=0 or v_stamp_amount>v_card.max_stamps_per_transaction then raise exception 'invalid stamp amount'; end if;
    select * into v_progress from public.stamp_progress where stamp_card_id=v_card.id and user_id=v_uid and status='active' order by round desc limit 1 for update;
    if not found then insert into public.stamp_progress(stamp_card_id,program_id,user_id,round) values(v_card.id,v_session.program_id,v_uid,1) returning * into v_progress; end if;
    v_new_count := least(v_progress.stamp_count+v_stamp_amount,v_card.required_stamps);
    update public.stamp_progress set stamp_count=v_new_count,status=case when v_new_count>=v_card.required_stamps then 'completed' else 'active' end,completed_at=case when v_new_count>=v_card.required_stamps then coalesce(completed_at,now()) else completed_at end,updated_at=now() where id=v_progress.id;
    insert into public.stamp_transactions(program_id,stamp_card_id,user_id,actor_id,amount,type,note,idempotency_key) values(v_session.program_id,v_card.id,v_uid,v_session.creator_id,v_stamp_amount,'earn',v_session.payload->>'note',v_session.id) returning id into v_tx;
    insert into public.notifications(user_id,type,title,message,metadata) values(v_uid,'stamp_received','Stamp received',format('+%s stamp',v_stamp_amount),jsonb_build_object('program_id',v_session.program_id,'completed',v_new_count>=v_card.required_stamps));
    v_result := jsonb_build_object('transaction_id',v_tx,'stamp_count',v_new_count,'required_stamps',v_card.required_stamps,'completed',v_new_count>=v_card.required_stamps);
  else
    raise exception 'qr action must be completed by its dedicated workflow';
  end if;
  update public.qr_sessions set status='used',used_at=now(),used_by=v_uid where id=v_session.id;
  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state) values(v_session.program_id,v_session.creator_id,'accept_qr_session','qr_session',v_session.id::text,jsonb_build_object('used_by',v_uid,'action',v_session.action));
  return jsonb_build_object('session_id',v_session.id,'action',v_session.action,'result',v_result);
end;
$$;
revoke all on function private.accept_qr_session_impl(text) from public,anon;
grant execute on function private.accept_qr_session_impl(text) to authenticated;

create or replace function public.accept_qr_session(p_token text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.accept_qr_session_impl(p_token); $$;
revoke all on function public.accept_qr_session(text) from public,anon;
grant execute on function public.accept_qr_session(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.program_members enable row level security;
alter table public.program_staff enable row level security;
alter table public.point_accounts enable row level security;
alter table public.point_transactions enable row level security;
alter table public.stamp_cards enable row level security;
alter table public.stamp_progress enable row level security;
alter table public.stamp_transactions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.qr_sessions enable row level security;
alter table public.friendships enable row level security;
alter table public.notifications enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_rules enable row level security;
alter table public.campaign_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()) or public_profile_enabled=true);
create policy profiles_update_self on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));

create policy programs_read on public.programs for select to authenticated using (visibility='public' or owner_id=(select auth.uid()) or private.is_program_member(id) or private.is_program_staff(id));
create policy programs_create on public.programs for insert to authenticated with check (owner_id=(select auth.uid()));
create policy programs_manage on public.programs for update to authenticated using (owner_id=(select auth.uid()) or private.is_program_staff(id,array['owner','admin'])) with check (owner_id=(select auth.uid()) or private.is_program_staff(id,array['owner','admin']));

create policy program_members_read on public.program_members for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id));
create policy program_staff_read on public.program_staff for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id,array['owner','admin','manager']));
