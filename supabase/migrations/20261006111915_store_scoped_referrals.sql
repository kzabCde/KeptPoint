alter table public.referral_codes
  drop constraint if exists referral_codes_code_key;

alter table public.referral_codes
  add constraint referral_codes_program_id_code_key unique (program_id, code);

create or replace function private.accept_referral_invite_impl(p_program_id uuid, p_code text)
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

  select p.* into v_program
  from public.programs p
  join public.program_referral_settings s on s.program_id = p.id and s.enabled = true
  where p.id = p_program_id and p.status = 'active';
  if not found then raise exception 'referrals are disabled or program unavailable'; end if;

  select rc.* into v_code
  from public.referral_codes rc
  where rc.program_id = p_program_id
    and rc.code = upper(trim(p_code));
  if not found then raise exception 'invalid referral code'; end if;

  if v_code.user_id = v_uid then raise exception 'cannot refer yourself'; end if;

  select * into v_ref
  from public.referrals
  where program_id = p_program_id and referred_id = v_uid
  for update;

  if found then
    if v_ref.referrer_id <> v_code.user_id then raise exception 'referral already claimed'; end if;
    v_membership := private.join_program_invited_impl(p_program_id);
    return jsonb_build_object(
      'program_id',p_program_id,
      'slug',v_program.slug,
      'membership_status',v_membership->>'status',
      'referral_id',v_ref.id,
      'referral_status',v_ref.status,
      'replayed',true
    );
  end if;

  if exists(
    select 1 from public.point_transactions
    where program_id = p_program_id
      and user_id = v_uid
      and type = 'earn'
      and source in ('manual','qr','purchase')
      and amount > 0
  ) then
    raise exception 'referral must be claimed before first earning activity';
  end if;

  v_membership := private.join_program_invited_impl(p_program_id);

  insert into public.referrals(program_id,referrer_id,referred_id,referral_code_id)
  values(p_program_id,v_code.user_id,v_uid,v_code.id)
  returning * into v_ref;

  insert into public.audit_logs(program_id,actor_id,action,resource_type,resource_id,after_state)
  values(
    p_program_id,
    v_uid,
    'accept_referral_invite',
    'referral',
    v_ref.id::text,
    jsonb_build_object('referrer_id',v_code.user_id,'membership_status',v_membership->>'status')
  );

  return jsonb_build_object(
    'program_id',p_program_id,
    'slug',v_program.slug,
    'membership_status',v_membership->>'status',
    'referral_id',v_ref.id,
    'referral_status',v_ref.status,
    'replayed',false
  );
end;
$$;

revoke all on function private.accept_referral_invite_impl(uuid,text) from public, anon;
grant execute on function private.accept_referral_invite_impl(uuid,text) to authenticated;

create or replace function private.accept_referral_invite_impl(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_program_id uuid;
  v_count integer;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;

  select count(*), min(rc.program_id::text)::uuid
  into v_count, v_program_id
  from public.referral_codes rc
  join public.program_referral_settings s on s.program_id = rc.program_id and s.enabled = true
  join public.programs p on p.id = rc.program_id and p.status = 'active'
  where rc.code = upper(trim(p_code));

  if v_count = 0 then raise exception 'invalid referral code'; end if;
  if v_count > 1 then raise exception 'ambiguous legacy referral code'; end if;

  return private.accept_referral_invite_impl(v_program_id, p_code);
end;
$$;

revoke all on function private.accept_referral_invite_impl(text) from public, anon;
grant execute on function private.accept_referral_invite_impl(text) to authenticated;

create or replace function public.accept_referral_invite(p_program_id uuid, p_code text)
returns jsonb
language sql
set search_path = ''
as $$ select private.accept_referral_invite_impl(p_program_id,p_code); $$;

revoke all on function public.accept_referral_invite(uuid,text) from public, anon;
grant execute on function public.accept_referral_invite(uuid,text) to authenticated;

create or replace function public.accept_referral_invite_legacy(p_code text)
returns jsonb
language sql
set search_path = ''
as $$ select private.accept_referral_invite_impl(p_code); $$;

revoke all on function public.accept_referral_invite_legacy(text) from public, anon;
grant execute on function public.accept_referral_invite_legacy(text) to authenticated;
