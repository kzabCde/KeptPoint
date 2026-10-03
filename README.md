# Keptpoint

Keptpoint is a universal point and stamp loyalty wallet where one account can both collect and issue rewards.

## MVP implemented in this scaffold

- Mobile-first App Router shell with Home, Wallet, Scan, Activity, Profile
- Supabase SSR clients and Next.js `proxy.ts` session refresh
- Email/password, magic-link and Google OAuth entry points
- Program creation form for points, stamps and hybrid programs
- Wallet/program/reward/stamp UI primitives
- Server actions wired to Supabase RPCs
- PostgreSQL schema with RLS, ledger tables, audit logs and secure RPC wrappers
- Atomic point issuing, stamp issuing, program join and reward redemption
- Short-lived one-time QR session primitives
- PWA manifest and install-ready assets
- Thai/English-ready message dictionary structure
- Pure TypeScript ledger invariants with Node tests

## Important transaction rules

- Point/stamp state is never mutated directly from the browser.
- Ledger history is append-only for normal operations.
- Reversals are compensating records rather than deletes.
- Sensitive RPC implementations live in the private schema.
- Public RPC wrappers are `security invoker`; private implementations perform explicit auth/role checks and are executable only by `authenticated`.
- RLS is enabled on exposed tables.

## Setup

1. Copy `.env.example` to `.env.local` and add a Supabase project URL and publishable key.
2. Apply all SQL files under `supabase/migrations/` to a development Supabase project in filename order.
3. Configure Supabase Auth providers and redirect URLs.
4. Install dependencies with `npm ci` (after generating/committing a lockfile in your networked development environment).
5. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

Do not deploy until all four checks pass.

## Security note

Never place a Supabase secret/service-role key in `NEXT_PUBLIC_*`. The frontend only needs the project URL and publishable key. Critical mutations are performed through authenticated database RPCs and RLS-protected data access.
