# SQC Pawn Storm Maniac Lichess Verifier — Live Deploy

Date: 2026-04-28 01:40 Europe/Stockholm  
Project: CC / Side Quest Chess  
Live: https://sidequestchess.com

## Shipped

Promoted `Pawn Storm Maniac` from a specified-only dare to a live-backed Lichess latest-game verifier.

## Implementation

- Added `src/lib/pawn-storm-maniac.ts` with:
  - Lichess latest-game NDJSON adapter.
  - UCI move normalization.
  - distinct player pawn-start counting before move 15.
  - standard chess, time-class, minimum-length, and player-win checks.
  - deterministic fallback fixtures for review mode.
- Added `tests/pawn-storm-maniac-fixtures.mjs` covering pass, insufficient pawn storm, loss, and UCI normalization cases.
- Wired `checkActiveChallenge()` to use the live pawn-storm verifier when a Lichess username is saved.
- Updated `src/lib/verifier-status.ts` so `/verifiers` and status badges mark Pawn Storm Maniac as live-backed.

## Verification

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke on `localhost:3011` ✅
  - `/verifiers` returned 200.
  - `/challenges/pawn-storm-maniac` returned 200.
  - `/account` returned 200 and rendered the Pawn Weather Warning badge context.
  - `/api/og/dare/pawn-storm-maniac` returned 200.
- Production deploy ✅
  - Deployment: `https://cc-bco1q2mwg-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/verifiers` returned 200 and contains `Pawn Storm Maniac`, `Live-backed`, and `six different player pawns`.
  - `https://sidequestchess.com/challenges/pawn-storm-maniac` returned 200 and contains `Pawn Storm Maniac`, `Live-backed`, `six different player pawns`, and `Pawn Weather Warning`.
  - `https://sidequestchess.com/account` returned 200.
  - `https://sidequestchess.com/api/og/dare/pawn-storm-maniac` returned 200 PNG `1200 x 630`.
- Vercel production 500 scan ✅
  - `node /Users/sam/.openclaw/workspace/scripts/deploy-verify/vercel-500-scan.mjs --project cc --since 30m`
  - Result: `total: 0`.

## Notes

The verifier intentionally counts six different player pawns moved before move 15; repeated moves by the same pawn do not inflate the storm count. It keeps the SQC promise honest: no PGN homework, no engine dashboard, no fake automated proof for challenges that are not live-backed.
