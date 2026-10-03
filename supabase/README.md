# Supabase setup

Apply all migration files in `supabase/migrations/` in filename order, and only to a development project first.

After applying it:

1. Generate TypeScript database types and replace any untyped Supabase usage if desired.
2. Run Supabase security and performance advisors.
3. Verify RLS with at least two users and one program with different roles.
4. Confirm direct client INSERT/UPDATE to ledger tables fails.
5. Confirm `issue_points`, `issue_stamp`, `redeem_reward`, and QR replay behavior work.
6. Configure storage object policies before enabling uploads in production UI. The migration creates the buckets but intentionally does not grant broad upload access.
7. Configure Auth email templates to use `/auth/confirm?token_hash={{ .TokenHash }}&type=email` for SSR confirmation.
