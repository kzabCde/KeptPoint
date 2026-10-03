# Keptpoint v0.1.0 scaffold status

## Implemented

- Next.js App Router project structure, mobile-first shell and bottom navigation.
- Home, Wallet, Scan/token acceptance, Activity, Profile, program detail and program creation routes.
- Email/password, magic-link and Google OAuth server actions using Supabase SSR patterns.
- Point ledger and point account schema with non-negative balance constraints.
- Reserved point balance for pending reward redemption; points are deducted only when staff completes the redemption.
- Stamp card/progress/transaction schema with historical rounds and reserved stamp progress during pending redemption.
- Rewards and secure pending -> completed/cancelled redemption RPCs.
- One-time, short-lived QR sessions; earn QR validation uses the staff member who created the QR rather than the customer who consumes it.
- Program member/staff tables and role-aware DB helpers.
- Notifications, campaigns/rules/events, friendships and audit log schema.
- RLS enabled on exposed application tables.
- Private SECURITY DEFINER implementations with explicit auth/role checks, with narrow public SECURITY INVOKER RPC wrappers.
- PWA manifest and 192/512 icons.
- Thai/English-ready message dictionary.

## Verification completed here

- TypeScript parser: all TS/TSX files parse with 0 syntax diagnostics.
- Pure TypeScript domain typecheck: passed.
- Node domain tests: 4/4 passed.
- JSON package manifest: valid.
- Migration structural checks: required core tables, RLS declarations and RPC wrappers present.

## Not yet verified — do not deploy

- `npm install` / lockfile generation could not complete because the package registry is unreachable from this runtime.
- Full `npm run lint`, `npm run typecheck`, and `npm run build` therefore have not been executed against installed dependencies.
- The migration has not been applied to a live Keptpoint Supabase project. The connected account currently has no dedicated Keptpoint project, and creating one can incur cost and requires explicit project/organization confirmation.
- Supabase security/performance advisors have not been run against this migration because it has not been applied remotely.
- Storage buckets are created by the migration, but upload policies are intentionally not opened yet. Upload UI should remain disabled until path-scoped policies are added and verified.
- The Scan screen accepts secure QR tokens and native-camera deep links, but an in-app camera decoder adapter is not included in this scaffold.

## Gate before Preview/Production

1. Install dependencies and commit the generated lockfile.
2. Run lint.
3. Run full typecheck.
4. Run tests.
5. Apply migration to a development Supabase project.
6. Generate Supabase TypeScript types.
7. Run Supabase security/performance advisors and fix findings.
8. Run end-to-end two-user tests for join -> issue -> wallet -> redeem -> staff confirm.
9. Run production build.
10. Only then create a Vercel Preview deployment.
