create or replace function private.join_program_invited_impl(p_program_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_program public.programs;
  v_existing_status text;
  v_status text;
begin
  if v_uid is null then raise exception 'authentication required'; end if;

  select * into v_program
  from public.programs
  where id = p_program_id and status = 'active';
  if not found then raise exception 'program unavailable'; end if;

  select status into v_existing_status
  from public.program_members
  where program_id = p_program_id and user_id = v_uid
  for update;

  if v_existing_status = 'blocked' then raise exception 'membership blocked'; end if;

  if v_existing_status in ('active','pending') then
    v_status := v_existing_status;
  else
    v_status := case when v_program.join_mode = 'approval' then 'pending' else 'active' end;
    if v_existing_status = 'left' then
      update public.program_members
      set status = v_status, joined_at = now(), last_activity_at = null
      where program_id = p_program_id and user_id = v_uid;
    else
      insert into public.program_members(program_id,user_id,status)
      values(p_program_id,v_uid,v_status);
    end if;
  end if;

  insert into public.point_accounts(program_id,user_id)
  values(p_program_id,v_uid)
  on conflict do nothing;

  return jsonb_build_object('program_id',p_program_id,'status',v_status);
end;
$$;

revoke all on function private.join_program_invited_impl(uuid) from public, anon, authenticated;

create or replace function private.accept_referral_invite_impl(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_code public.referral_codes;
  v_program public.programs;
  v_ref public.referrals;
  v_membership jsonb;
begin
  if v_uid is null then raise exception 'authentication required'; end if;

  select rc.* into v_code
  from public.referral_codes rc
  join public.program_referral_settings s on s.program_id = rc.program_id and s.enabled = true
  join public.programs p on p.id = rc.program_id and p.status = 'active'
  where rc.code = upper(trim(p_code));
  if not found then raise exception 'invalid referral code'; end if;

  select * into v_program from public.programs where id = v_code.program_id;
  if v_code.user_id = v_uid then raise exception 'cannot refer yourself'; end if;

  select * into v_ref
  from public.referrals
  where program_id = v_code.program_id and referred_id = v_uid
  for update;

  if found then
    if v_ref.referrer_id <> v_code.user_id then raise exception 'referral already claimed'; end if;
    v_membership := private.join_program_invited_impl(v_code.program_id);
    return jsonb_build_object(
      'program_id',v_code.program_id,
      'slug',v_program.slug,
      'membership_status',v_membership->>'status',
      'referral_id',v_ref.id,
      'referral_status',v_ref.status,
      'replayed',true
    );
  end if;

  if exists(
    select 1 from public.point_transactions
    where program_id = v_code.program_id
      and user_id = v_uid
      and type = 'earn'
      and source in ('manual','qr','purchase')
      and amount > 0
  ) then
    raise exception 'referral must be claimed before first earning activity';
  end if;

  v_membership := private.join_program_invited_impl(v_code.program_id);

  insert into public.referrals(program_id,referrer_id,referred_id,referral_code_id)
  values(v_code.program_id,v_code.user_id,v_uid,v_code.id)
  returning * into v_ref;

  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state)
  values(
    v_code.program_id,
    v_uid,
    'accept_referral_invite',
    'referral',
    v_ref.id::text,
    jsonb_build_object('referrer_id',v_code.user_id,'membership_status',v_membership->>'status')
  );

  return jsonb_build_object(
    'program_id',v_code.program_id,
    'slug',v_program.slug,
    'membership_status',v_membership->>'status',
    'referral_id',v_ref.id,
    'referral_status',v_ref.status,
    'replayed',false
  );
end;
$$;

revoke all on function private.accept_referral_invite_impl(text) from public, anon;
grant execute on function private.accept_referral_invite_impl(text) to authenticated;

create or replace function public.accept_referral_invite(p_code text)
returns jsonb
language sql
set search_path = ''
as $$ select private.accept_referral_invite_impl(p_code); $$;

revoke all on function public.accept_referral_invite(text) from public, anon;
grant execute on function public.accept_referral_invite(text) to authenticated;

create or replace function private.create_qr_session_impl(
  p_program_id uuid,
  p_action text,
  p_payload jsonb,
  p_ttl_seconds integer
)
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

  select * into v_program
  from public.programs
  where id = p_program_id and status = 'active';
  if not found then raise exception 'program unavailable'; end if;

  if p_action in ('join','earn_points','earn_stamp')
     and not private.is_program_staff(p_program_id,array['owner','admin','manager','cashier']) then
    raise exception 'not authorized';
  end if;

  if p_action = 'earn_points' then
    if v_program.program_type not in ('points','hybrid') then raise exception 'points not supported by program'; end if;
    begin
      v_amount := (p_payload->>'amount')::bigint;
    exception when others then
      raise exception 'invalid qr amount';
    end;
    if v_amount is null or v_amount < 1 or v_amount > 1000000 then raise exception 'invalid qr amount'; end if;
  elsif p_action = 'earn_stamp' then
    if v_program.program_type not in ('stamps','hybrid') then raise exception 'stamps not supported by program'; end if;
    select * into v_card
    from public.stamp_cards
    where program_id = p_program_id and active = true
    order by created_at
    limit 1;
    if not found then raise exception 'active stamp card not found'; end if;
    begin
      v_amount := coalesce((p_payload->>'amount')::bigint,1);
    exception when others then
      raise exception 'invalid qr amount';
    end;
    if v_amount < 1 or v_amount > v_card.max_stamps_per_transaction then raise exception 'invalid stamp amount'; end if;
  end if;

  insert into public.qr_sessions(token_hash,program_id,creator_id,action,payload,expires_at)
  values(
    pg_catalog.encode(extensions.digest(v_raw,'sha256'),'hex'),
    p_program_id,
    v_uid,
    p_action,
    coalesce(p_payload,'{}'::jsonb),
    now()+make_interval(secs=>p_ttl_seconds)
  )
  returning id into v_id;

  return jsonb_build_object('session_id',v_id,'token',v_raw,'expires_in',p_ttl_seconds);
end;
$$;

revoke all on function private.create_qr_session_impl(uuid,text,jsonb,integer) from public, anon;
grant execute on function private.create_qr_session_impl(uuid,text,jsonb,integer) to authenticated;

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

  select * into v_session
  from public.qr_sessions
  where token_hash = pg_catalog.encode(extensions.digest(trim(p_token),'sha256'),'hex')
  for update;
  if not found then raise exception 'invalid qr'; end if;
  if v_session.status <> 'active' or v_session.used_at is not null then raise exception 'qr already used'; end if;
  if v_session.expires_at <= now() then raise exception 'qr expired'; end if;
  if v_session.creator_id = v_uid then raise exception 'cannot accept own qr'; end if;

  if v_session.action = 'join' then
    if not exists(
      select 1 from public.program_staff
      where program_id=v_session.program_id and user_id=v_session.creator_id and role in ('owner','admin','manager','cashier')
    ) and not exists(
      select 1 from public.programs
      where id=v_session.program_id and owner_id=v_session.creator_id
    ) then raise exception 'qr creator is not authorized'; end if;
    v_result := private.join_program_invited_impl(v_session.program_id);

  elsif v_session.action = 'earn_points' then
    if not exists(
      select 1 from public.program_staff
      where program_id=v_session.program_id and user_id=v_session.creator_id and role in ('owner','admin','manager','cashier')
    ) and not exists(
      select 1 from public.programs
      where id=v_session.program_id and owner_id=v_session.creator_id
    ) then raise exception 'qr creator is not authorized'; end if;
    if not exists(select 1 from public.programs where id=v_session.program_id and status='active' and program_type in ('points','hybrid')) then raise exception 'program unavailable'; end if;
    if not exists(select 1 from public.program_members where program_id=v_session.program_id and user_id=v_uid and status='active') then raise exception 'member not active'; end if;

    begin
      v_amount := (v_session.payload->>'amount')::bigint;
    exception when others then
      raise exception 'invalid qr amount';
    end;
    if v_amount is null or v_amount < 1 or v_amount > 1000000 then raise exception 'invalid qr amount'; end if;

    insert into public.point_accounts(program_id,user_id)
    values(v_session.program_id,v_uid)
    on conflict do nothing;
    select balance into v_balance
    from public.point_accounts
    where program_id=v_session.program_id and user_id=v_uid
    for update;

    insert into public.point_transactions(program_id,user_id,actor_id,amount,type,source,note,idempotency_key)
    values(v_session.program_id,v_uid,v_session.creator_id,v_amount,'earn','qr',v_session.payload->>'note',v_session.id)
    returning id into v_tx;

    update public.point_accounts
    set balance=balance+v_amount,
        lifetime_earned=lifetime_earned+v_amount,
        last_activity_at=now(),
        updated_at=now()
    where program_id=v_session.program_id and user_id=v_uid
    returning balance into v_balance;

    insert into public.notifications(user_id,type,title,message,metadata)
    values(v_uid,'points_received','Points received',format('+%s points',v_amount),jsonb_build_object('program_id',v_session.program_id,'transaction_id',v_tx));
    v_result := jsonb_build_object('transaction_id',v_tx,'balance',v_balance);

  elsif v_session.action = 'earn_stamp' then
    if not exists(
      select 1 from public.program_staff
      where program_id=v_session.program_id and user_id=v_session.creator_id and role in ('owner','admin','manager','cashier')
    ) and not exists(
      select 1 from public.programs
      where id=v_session.program_id and owner_id=v_session.creator_id
    ) then raise exception 'qr creator is not authorized'; end if;
    if not exists(select 1 from public.programs where id=v_session.program_id and status='active' and program_type in ('stamps','hybrid')) then raise exception 'program unavailable'; end if;
    if not exists(select 1 from public.program_members where program_id=v_session.program_id and user_id=v_uid and status='active') then raise exception 'member not active'; end if;

    select * into v_card
    from public.stamp_cards
    where program_id=v_session.program_id and active=true
    order by created_at
    limit 1;
    if not found then raise exception 'active stamp card not found'; end if;

    begin
      v_stamp_amount := coalesce((v_session.payload->>'amount')::integer,1);
    exception when others then
      raise exception 'invalid qr amount';
    end;
    if v_stamp_amount<=0 or v_stamp_amount>v_card.max_stamps_per_transaction then raise exception 'invalid stamp amount'; end if;

    select * into v_progress
    from public.stamp_progress
    where stamp_card_id=v_card.id and user_id=v_uid and status='active'
    order by round desc
    limit 1
    for update;

    if not found then
      insert into public.stamp_progress(stamp_card_id,program_id,user_id,round)
      values(v_card.id,v_session.program_id,v_uid,1)
      on conflict(stamp_card_id,user_id,round) do nothing;
      select * into v_progress
      from public.stamp_progress
      where stamp_card_id=v_card.id and user_id=v_uid and status='active'
      order by round desc
      limit 1
      for update;
      if not found then raise exception 'active stamp progress unavailable'; end if;
    end if;

    v_new_count := least(v_progress.stamp_count+v_stamp_amount,v_card.required_stamps);
    update public.stamp_progress
    set stamp_count=v_new_count,
        status=case when v_new_count>=v_card.required_stamps then 'completed' else 'active' end,
        completed_at=case when v_new_count>=v_card.required_stamps then coalesce(completed_at,now()) else completed_at end,
        updated_at=now()
    where id=v_progress.id;

    insert into public.stamp_transactions(program_id,stamp_card_id,user_id,actor_id,amount,type,note,idempotency_key)
    values(v_session.program_id,v_card.id,v_uid,v_session.creator_id,v_stamp_amount,'earn',v_session.payload->>'note',v_session.id)
    returning id into v_tx;

    insert into public.notifications(user_id,type,title,message,metadata)
    values(v_uid,'stamp_received','Stamp received',format('+%s stamp',v_stamp_amount),jsonb_build_object('program_id',v_session.program_id,'completed',v_new_count>=v_card.required_stamps));
    v_result := jsonb_build_object('transaction_id',v_tx,'stamp_count',v_new_count,'required_stamps',v_card.required_stamps,'completed',v_new_count>=v_card.required_stamps);

  else
    raise exception 'qr action must be completed by its dedicated workflow';
  end if;

  update public.qr_sessions
  set status='used',used_at=now(),used_by=v_uid
  where id=v_session.id;

  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state)
  values(v_session.program_id,v_session.creator_id,'accept_qr_session','qr_session',v_session.id::text,jsonb_build_object('used_by',v_uid,'action',v_session.action));

  return jsonb_build_object('session_id',v_session.id,'action',v_session.action,'result',v_result);
end;
$$;

revoke all on function private.accept_qr_session_impl(text) from public, anon;
grant execute on function private.accept_qr_session_impl(text) to authenticated;

create or replace function public.create_qr_session(
  p_program_id uuid,
  p_action text,
  p_payload jsonb default '{}'::jsonb,
  p_ttl_seconds integer default 90
)
returns jsonb
language sql
set search_path = ''
as $$ select private.create_qr_session_impl(p_program_id,p_action,p_payload,p_ttl_seconds); $$;

create or replace function public.accept_qr_session(p_token text)
returns jsonb
language sql
set search_path = ''
as $$ select private.accept_qr_session_impl(p_token); $$;

revoke all on function public.create_qr_session(uuid,text,jsonb,integer) from public, anon;
grant execute on function public.create_qr_session(uuid,text,jsonb,integer) to authenticated;
revoke all on function public.accept_qr_session(text) from public, anon;
grant execute on function public.accept_qr_session(text) to authenticated;
