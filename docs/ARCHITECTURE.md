# Keptpoint architecture

Keptpoint uses one universal identity. A user is not permanently a customer or merchant; program membership and staff records define permissions within each program.

## Transaction boundary

The browser never writes balances, stamp progress, QR usage, redemptions or audit logs directly. Critical operations are exposed as narrow Postgres RPCs. Public RPC wrappers run as security invoker and call private implementations. The private implementations validate `auth.uid()`, program membership/staff role, program state, limits and idempotency before changing state atomically.

## Points

`point_transactions` is the immutable ledger. `point_accounts.balance` is a transactionally maintained cache. `reserved_balance` protects pending reward redemption from double-spend. Completing redemption creates the negative ledger entry; cancelling releases the reserve.

## Stamps

`stamp_transactions` records stamp changes. `stamp_progress` preserves rounds. A completed round is temporarily moved to `reserved` during pending redemption, then to `redeemed` only after staff confirmation; cancellation restores it to `completed`.

## QR

The raw token is returned once to the creator and only its SHA-256 hash is stored. Sessions have a bounded TTL and one-use state. For staff-created earn QR codes, permission is checked against the creator identity saved on the session, while the scanning user becomes the recipient.

## Frontend

Next.js App Router is used with Server Components by default and Server Actions for mutations. Supabase SSR clients store auth sessions in cookies refreshed through `proxy.ts`. The primary mobile navigation is Home / Wallet / Scan / Activity / Profile.
