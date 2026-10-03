create policy point_accounts_read on public.point_accounts for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id,array['owner','admin','manager','cashier']));
create policy point_transactions_read on public.point_transactions for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id,array['owner','admin','manager','cashier']));

create policy stamp_cards_read on public.stamp_cards for select to authenticated using (private.is_program_member(program_id) or private.is_program_staff(program_id) or exists(select 1 from public.programs p where p.id=program_id and p.visibility='public'));
create policy stamp_cards_manage on public.stamp_cards for all to authenticated using (private.is_program_staff(program_id,array['owner','admin','manager'])) with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy stamp_progress_read on public.stamp_progress for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id));
create policy stamp_transactions_read on public.stamp_transactions for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id));

create policy rewards_read on public.rewards for select to authenticated using (private.is_program_member(program_id) or private.is_program_staff(program_id) or exists(select 1 from public.programs p where p.id=program_id and p.visibility='public'));
create policy rewards_manage on public.rewards for all to authenticated using (private.is_program_staff(program_id,array['owner','admin','manager'])) with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy redemptions_read on public.reward_redemptions for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id));

create policy qr_sessions_read on public.qr_sessions for select to authenticated using (creator_id=(select auth.uid()) or used_by=(select auth.uid()));
create policy friendships_read on public.friendships for select to authenticated using (requester_id=(select auth.uid()) or addressee_id=(select auth.uid()));
create policy friendships_insert on public.friendships for insert to authenticated with check (requester_id=(select auth.uid()));
create policy friendships_update on public.friendships for update to authenticated using (requester_id=(select auth.uid()) or addressee_id=(select auth.uid())) with check (requester_id=(select auth.uid()) or addressee_id=(select auth.uid()));
create policy notifications_read on public.notifications for select to authenticated using (user_id=(select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy campaigns_read on public.campaigns for select to authenticated using (private.is_program_member(program_id) or private.is_program_staff(program_id));
create policy campaigns_manage on public.campaigns for all to authenticated using (private.is_program_staff(program_id,array['owner','admin','manager'])) with check (private.is_program_staff(program_id,array['owner','admin','manager']));
create policy campaign_rules_read on public.campaign_rules for select to authenticated using (exists(select 1 from public.campaigns c where c.id=campaign_id and (private.is_program_member(c.program_id) or private.is_program_staff(c.program_id))));
create policy campaign_rules_manage on public.campaign_rules for all to authenticated using (exists(select 1 from public.campaigns c where c.id=campaign_id and private.is_program_staff(c.program_id,array['owner','admin','manager']))) with check (exists(select 1 from public.campaigns c where c.id=campaign_id and private.is_program_staff(c.program_id,array['owner','admin','manager'])));
create policy campaign_events_read on public.campaign_events for select to authenticated using (user_id=(select auth.uid()) or private.is_program_staff(program_id));
create policy audit_logs_read on public.audit_logs for select to authenticated using (program_id is not null and private.is_program_staff(program_id,array['owner','admin','manager']));

revoke insert,update,delete on public.point_accounts from anon,authenticated;
revoke insert,update,delete on public.point_transactions from anon,authenticated;
revoke insert,update,delete on public.stamp_progress from anon,authenticated;
revoke insert,update,delete on public.stamp_transactions from anon,authenticated;
revoke insert,update,delete on public.reward_redemptions from anon,authenticated;
revoke insert,update,delete on public.qr_sessions from anon,authenticated;
revoke insert,update,delete on public.audit_logs from anon,authenticated;

grant select on public.profiles,public.programs,public.program_members,public.program_staff,public.point_accounts,public.point_transactions,public.stamp_cards,public.stamp_progress,public.stamp_transactions,public.rewards,public.reward_redemptions,public.qr_sessions,public.friendships,public.notifications,public.campaigns,public.campaign_rules,public.campaign_events,public.audit_logs to authenticated;
grant insert on public.programs,public.friendships to authenticated;
grant update on public.profiles,public.programs,public.friendships,public.notifications to authenticated;
grant insert,update,delete on public.stamp_cards,public.rewards,public.campaigns,public.campaign_rules to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
  ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('program-assets','program-assets',true,10485760,array['image/jpeg','image/png','image/webp']),
  ('reward-assets','reward-assets',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
