alter table public.profiles
  add column if not exists password_set boolean not null default false;

update public.profiles as p
set password_set = exists (
  select 1
  from auth.users as u
  where u.id = p.id
    and nullif(u.encrypted_password, '') is not null
);
