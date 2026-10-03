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
- RLS enabled on all 18 exposed application tables.
- Private SECURITY DEFINER implementations with explicit auth/role checks, with narrow public SECURITY INVOKER RPC wrappers.
- Sensitive ledger/redemption/QR tables deny direct INSERT/UPDATE/DELETE to anon and authenticated roles.
- Critical public RPCs deny anon EXECUTE and allow authenticated EXECUTE.
- Foreign-key covering indexes added from Supabase performance advisor findings.
- Duplicate permissive SELECT policies removed by splitting management policies into mutation-only policies.
- Generated Supabase database types committed at `types/database.ts`.
- Browser/server/proxy Supabase clients are typed with the generated `Database` type.
- PWA manifest and 192/512 icons.
- Thai/English-ready message dictionary.
- GitHub Actions CI gate runs install -> lint -> typecheck -> tests -> production build.

## Supabase development database

Project: `gabdlrfoizyfhajyqlvv` (KeptPoint, ap-southeast-1)

Applied migrations:

1. keptpoint_core_01
2. keptpoint_core_02
3. keptpoint_core_03
4. keptpoint_core_04
5. keptpoint_core_05
6. keptpoint_core_06
7. keptpoint_core_07
8. keptpoint_performance_indexes_and_policies

Verification:

- 18/18 application tables have RLS enabled.
- Supabase Security Advisor: 0 findings.
- Unindexed foreign-key findings: resolved.
- Multiple permissive policy findings: resolved.
- Remaining performance notices are only unused-index INFO findings, expected on a new empty database.
- Sensitive ledger tables have no direct mutation privileges for anon/authenticated.
- Critical RPCs are not executable by anon and are executable by authenticated.

## Verification completed

- Local TypeScript parser check: 0 syntax diagnostics on the original scaffold.
- Pure TypeScript domain tests: 4/4 passed on the original scaffold.
- Generated database types now match the live development schema.
- GitHub Actions CI workflow is the authoritative full dependency/build gate.

## Still required before Vercel Preview

1. GitHub Actions CI must pass:
   - dependency install
   - lint
   - full typecheck
   - tests
   - production build
2. Commit a generated npm lockfile for reproducible installs.
3. Configure real Supabase environment variables outside source control.
4. Configure Auth providers/redirect URLs and email confirmation template.
5. Add path-scoped Storage object policies before enabling uploads.
6. Run end-to-end two-user tests for join -> issue -> wallet -> redeem -> staff confirm.
7. Add/verify in-app camera decoder if required for the Scan UX.
8. Only after these gates pass, create a Vercel Preview deployment.

Do not deploy to Vercel while any CI/build gate is failing or pending.
