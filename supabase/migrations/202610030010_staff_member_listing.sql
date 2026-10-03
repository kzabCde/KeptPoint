create or replace function private.list_program_members_impl(p_program_id uuid)
returns table (
  user_id uuid,
  display_name text,
  username text,
  member_status text,
  joined_at timestamptz,
  last_activity_at timestamptz,
  balance bigint,
  reserved_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  if not private.is_program_staff(p_program_id, array['owner','admin','manager','cashier']) then
    raise exception 'not authorized';
  end if;

  return query
  select
    m.user_id,
    coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'KeptPoint member') as display_name,
    p.username,
    m.status as member_status,
    m.joined_at,
    m.last_activity_at,
    coalesce(a.balance, 0) as balance,
    coalesce(a.reserved_balance, 0) as reserved_balance
  from public.program_members m
  left join public.profiles p on p.id = m.user_id
  left join public.point_accounts a
    on a.program_id = m.program_id
   and a.user_id = m.user_id
  where m.program_id = p_program_id
  order by m.joined_at desc;
end;
$$;

revoke all on function private.list_program_members_impl(uuid) from public, anon;
grant execute on function private.list_program_members_impl(uuid) to authenticated;

create or replace function public.list_program_members(p_program_id uuid)
returns table (
  user_id uuid,
  display_name text,
  username text,
  member_status text,
  joined_at timestamptz,
  last_activity_at timestamptz,
  balance bigint,
  reserved_balance bigint
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.list_program_members_impl(p_program_id);
$$;

revoke all on function public.list_program_members(uuid) from public, anon;
grant execute on function public.list_program_members(uuid) to authenticated;
