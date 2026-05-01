# SQC support/privacy route live deploy — 2026-05-01

## Change

Added a dedicated `/support` route for Side Quest Chess private beta trust basics:

- what to send when setup, rule, receipt, or UI issues appear;
- public username + chess-site context needed for verifier debugging;
- public-game-data privacy posture;
- explicit “no chess-site passwords” guidance;
- quick links back to `/beta`, `/connect`, `/rules`, `/challenges`, and `/result`.

Also linked the route from the primary nav, homepage trust block, and private-beta guide.

## Why

The current private/friends beta roadmap asks for trust basics before broader traffic: privacy/data note, contact/support, and clear Lichess/Chess.com public-game-data explanation. This turns those notes into a discoverable product surface instead of burying them only in beta copy.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Build included dynamic route `/support` ✅

## Deployment

Pending at document creation; fill deploy URL and live smoke after production deploy.
