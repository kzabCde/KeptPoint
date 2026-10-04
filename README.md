# KeptPoint

KeptPoint is a universal points, stamps and rewards wallet where one account can both collect rewards and operate loyalty programs.

Production: https://keptpoint.vercel.app

## v0.1.4 — Hybrid Auth + Cute UX Refresh

KeptPoint v0.1.4 moves authentication to a hybrid model and introduces a warmer, friendlier reward-wallet design.

### Authentication

- First registration: Username + Email → one-time email link → authenticated session → mandatory Set Password → Home
- Everyday login: Email + Password
- Magic Link remains available as a secondary login method
- Forgot Password → recovery email → Reset Password
- Settings → Security → Change Password
- Email rate-limit errors are handled without exposing account existence
- `profiles.password_set` tracks whether account setup is complete; existing password users are backfilled during migration

For production-scale authentication email delivery, configure **Custom SMTP** in Supabase. Do not commit SMTP credentials to this repository.

### Loyalty experience

- Real Supabase-backed Home, Wallet, Activity and Notifications
- Points, stamps and hybrid loyalty programs
- Visual stamp grids and reward progress
- Locked / almost available / available / pending / redeemed reward states
- QR scanning with secure one-time server validation
- Program owner/staff member management and issuing flows
- Merchant overview with member/reward/redemption/activity summaries

### Design

The v0.1.4 UI uses the approved KeptPoint artwork and a friendly reward-wallet visual language: deep teal, mint, warm gold, coral and lavender; rounded tactile cards; clearer empty/loading/error states; Thai/English; Light/Dark/System themes; mobile-first safe-area-aware navigation.

## Important transaction rules

- Point/stamp state is never mutated directly from the browser.
- Ledger history is append-only for normal operations.
- Reversals are compensating records rather than deletes.
- Sensitive RPC implementations live in the private schema.
- Public RPC wrappers are `security invoker`; private implementations perform explicit auth/role checks and are executable only by `authenticated`.
- RLS is enabled on exposed tables.

## Setup

1. Copy `.env.example` to `.env.local` and add a Supabase project URL and publishable key.
2. Apply all SQL files under `supabase/migrations/` in filename order.
3. Configure Supabase Auth Site URL, allowed redirect URLs, email templates and optional OAuth providers.
4. Configure Custom SMTP before higher-volume production use.
5. Install dependencies.
6. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

Do not deploy until all four checks pass. Do not create a Vercel Preview before the CI gate is green.

## Security note

Never place a Supabase secret/service-role key, SMTP password or other privileged credential in `NEXT_PUBLIC_*` or source control. The frontend only needs the project URL and publishable key. Critical mutations are performed through authenticated database RPCs and RLS-protected data access.
