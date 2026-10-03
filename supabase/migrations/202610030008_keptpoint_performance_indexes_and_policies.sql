-- Cover foreign keys reported by Supabase performance advisor.
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_program_id_idx on public.audit_logs(program_id);
create index if not exists campaign_events_campaign_id_idx on public.campaign_events(campaign_id);
create index if not exists campaign_events_program_id_idx on public.campaign_events(program_id);
create index if not exists campaign_events_user_id_idx on public.campaign_events(user_id);
create index if not exists campaign_rules_campaign_id_idx on public.campaign_rules(campaign_id);
create index if not exists campaigns_program_id_idx on public.campaigns(program_id);
create index if not exists friendships_addressee_id_idx on public.friendships(addressee_id);
create index if not exists point_transactions_actor_id_idx on public.point_transactions(actor_id);
create index if not exists point_transactions_reversal_of_idx on public.point_transactions(reversal_of);
create index if not exists programs_owner_id_idx on public.programs(owner_id);
create index if not exists qr_sessions_creator_id_idx on public.qr_sessions(creator_id);
create index if not exists qr_sessions_program_id_idx on public.qr_sessions(program_id);
create index if not exists qr_sessions_used_by_idx on public.qr_sessions(used_by);
create index if not exists reward_redemptions_points_transaction_id_idx on public.reward_redemptions(points_transaction_id);
create index if not exists reward_redemptions_reward_id_idx on public.reward_redemptions(reward_id);
create index if not exists reward_redemptions_stamp_progress_id_idx on public.reward_redemptions(stamp_progress_id);
create index if not exists stamp_cards_program_id_idx on public.stamp_cards(program_id);
create index if not exists stamp_progress_program_id_idx on public.stamp_progress(program_id);
create index if not exists stamp_transactions_actor_id_idx on public.stamp_transactions(actor_id);
create index if not exists stamp_transactions_stamp_card_id_idx on public.stamp_transactions(stamp_card_id);

-- Avoid duplicate permissive SELECT policies by making management policies mutation-only.
drop policy if exists stamp_cards_manage on public.stamp_cards;
create policy stamp_cards_insert on public.stamp_cards for insert to authenticated
with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy stamp_cards_update on public.stamp_cards for update to authenticated
using (private.is_program_staff(program_id,array['owner','admin','manager']))
with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy stamp_cards_delete on public.stamp_cards for delete to authenticated
using (private.is_program_staff(program_id,array['owner','admin','manager']));

drop policy if exists rewards_manage on public.rewards;
create policy rewards_insert on public.rewards for insert to authenticated
with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy rewards_update on public.rewards for update to authenticated
using (private.is_program_staff(program_id,array['owner','admin','manager']))
with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy rewards_delete on public.rewards for delete to authenticated
using (private.is_program_staff(program_id,array['owner','admin','manager']));

drop policy if exists campaigns_manage on public.campaigns;
create policy campaigns_insert on public.campaigns for insert to authenticated
with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy campaigns_update on public.campaigns for update to authenticated
using (private.is_program_staff(program_id,array['owner','admin','manager']))
with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy campaigns_delete on public.campaigns for delete to authenticated
using (private.is_program_staff(program_id,array['owner','admin','manager']));

drop policy if exists campaign_rules_manage on public.campaign_rules;
create policy campaign_rules_insert on public.campaign_rules for insert to authenticated
with check (
  exists(
    select 1 from public.campaigns c
    where c.id=campaign_id
      and private.is_program_staff(c.program_id,array['owner','admin','manager'])
  )
);
create policy campaign_rules_update on public.campaign_rules for update to authenticated
using (
  exists(
    select 1 from public.campaigns c
    where c.id=campaign_id
      and private.is_program_staff(c.program_id,array['owner','admin','manager'])
  )
)
with check (
  exists(
    select 1 from public.campaigns c
    where c.id=campaign_id
      and private.is_program_staff(c.program_id,array['owner','admin','manager'])
  )
);
create policy campaign_rules_delete on public.campaign_rules for delete to authenticated
using (
  exists(
    select 1 from public.campaigns c
    where c.id=campaign_id
      and private.is_program_staff(c.program_id,array['owner','admin','manager'])
  )
);
