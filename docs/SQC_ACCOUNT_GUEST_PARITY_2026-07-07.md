# SQC Account Guest Parity - 2026-07-07

## Source

- Mobile source of truth: `apps/mobile/App.tsx`, `TodayDashboard` signed-out Account branch.
- Mobile signed-out labels:
  - `Sign in to continue.`
  - `Browse Solo Side Quests`
  - `Browse Multiplayer Side Quests`
  - `Choose sign-in method`

## Web Slice

- Updated `/account` signed-out hero to use the same headline, product copy, and action labels as the mobile Account guest screen.
- Added the missing signed-out Multiplayer browse path to the Account setup checklist.
- Kept existing Clerk sign-in routing and account sync/proof logic intact.

## Verification

- `pnpm build` passed.
- Local screenshot attempt: blocked by the existing Clerk local session refresh loop. `next start` served, but `/account` returned `Internal Server Error` and the server log repeatedly reported: `Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match`.
- Static/code proof: `/account` signed-out markup now contains the mobile labels listed above and links to `/solo`, `/multiplayer`, and `/sign-in`.

## Remaining Account Gaps

- Signed-in web Account still uses server-rendered rows instead of the mobile app's in-place refresh/modal interactions.
- Web Profile, Connect, Settings, and Support remain separate routes, though `/account` and `/settings` now group them with mobile-facing labels.
