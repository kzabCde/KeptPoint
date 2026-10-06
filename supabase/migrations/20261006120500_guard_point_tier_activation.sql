create or replace function private.guard_program_tier_activation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.programs p
    where p.id = new.program_id
      and p.program_type in ('points','hybrid')
      and p.point_tier_enabled = true
  ) then
    new.active := false;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_program_tier_activation_trigger on public.program_tiers;
create trigger guard_program_tier_activation_trigger
before insert or update of active, program_id on public.program_tiers
for each row execute function private.guard_program_tier_activation();

update public.program_tiers t
set active = false, updated_at = now()
where active = true
  and not exists (
    select 1 from public.programs p
    where p.id=t.program_id
      and p.program_type in ('points','hybrid')
      and p.point_tier_enabled=true
  );
