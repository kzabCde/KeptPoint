alter table public.profiles
  add column if not exists locale text not null default 'th',
  add column if not exists theme text not null default 'system';

alter table public.profiles
  drop constraint if exists profiles_locale_check,
  add constraint profiles_locale_check check (locale in ('th','en')),
  drop constraint if exists profiles_theme_check,
  add constraint profiles_theme_check check (theme in ('system','light','dark'));
