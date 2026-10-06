create index if not exists coupon_redemptions_program_id_idx on public.coupon_redemptions(program_id);
create index if not exists referral_codes_user_id_idx on public.referral_codes(user_id);
create index if not exists referrals_referral_code_id_idx on public.referrals(referral_code_id);
create index if not exists referrals_referred_id_idx on public.referrals(referred_id);
create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);

drop policy if exists "tiers public read" on public.program_tiers;
drop policy if exists "tiers staff read" on public.program_tiers;
create policy "tiers readable" on public.program_tiers for select to anon,authenticated
using (
  (active and exists(select 1 from public.programs p where p.id=program_id and p.status='active' and p.visibility='public'))
  or ((select auth.uid()) is not null and (select private.is_program_staff(program_id,array['owner','admin','manager','cashier'])))
);
