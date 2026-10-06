-- Growth checkpoint 4: program tiers derived from existing lifetime_earned totals.

create table if not exists public.program_tiers (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  min_lifetime_earned bigint not null default 0 check (min_lifetime_earned >= 0),
  benefits jsonb not null default '[]'::jsonb check (jsonb_typeof(benefits)='array'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(program_id,name),
  unique(program_id,min_lifetime_earned)
);

create index if not exists program_tiers_lookup_idx on public.program_tiers(program_id,active,min_lifetime_earned);

alter table public.program_tiers enable row level security;

revoke all on public.program_tiers from anon,authenticated;
grant select on public.program_tiers to anon,authenticated;
grant insert,update,delete on public.program_tiers to authenticated;
grant all on public.program_tiers to service_role;

drop policy if exists "tiers public read" on public.program_tiers;
create policy "tiers public read" on public.program_tiers
for select to anon,authenticated
using (
  active and exists(
    select 1 from public.programs p
    where p.id=program_id and p.status='active' and p.visibility='public'
  )
);

drop policy if exists "tiers staff read" on public.program_tiers;
create policy "tiers staff read" on public.program_tiers
for select to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])));

drop policy if exists "tiers staff insert" on public.program_tiers;
create policy "tiers staff insert" on public.program_tiers
for insert to authenticated
with check ((select private.is_program_staff(program_id,array['owner','admin','manager'])));

drop policy if exists "tiers staff update" on public.program_tiers;
create policy "tiers staff update" on public.program_tiers
for update to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager'])))
with check ((select private.is_program_staff(program_id,array['owner','admin','manager'])));

drop policy if exists "tiers staff delete" on public.program_tiers;
create policy "tiers staff delete" on public.program_tiers
for delete to authenticated
using ((select private.is_program_staff(program_id,array['owner','admin','manager'])));
