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

- Production deployment: `https://cc-h3hlsdh86-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

## Live smoke

- `https://cc-h3hlsdh86-andreas-nordenadlers-projects.vercel.app/support` returned HTTP 200 and contained `Funny dares, boringly clear trust rules`, `Chess-site passwords`, and `Challenge + site + receipt`.
- `https://sidequestchess.com/support` returned HTTP 200 with the same support/privacy content.
- `https://sidequestchess.com/beta` returned HTTP 200 and contained the `/support` link.
- `https://sidequestchess.com/` returned HTTP 200 and contained the `/support` link.
- Bounded Vercel log stream opened for deployment `dpl_3jTD9Qp2LhHDTvwhsnV3mq3EBo2F` and emitted no runtime error/500/exception/crash lines during the smoke window.
