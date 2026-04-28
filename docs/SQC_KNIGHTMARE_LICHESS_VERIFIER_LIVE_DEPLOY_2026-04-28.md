# SQC Knightmare Mode Lichess verifier live deploy — 2026-04-28

## Summary

Promoted `Knightmare Mode` from specified-only to a live-backed Lichess latest-game verifier.

## Product impact

- `/account` latest-game checks now use a real rule-backed verifier for `Knightmare Mode` when a Lichess username is saved.
- `/verifiers` and challenge verifier status surfaces now mark `Knightmare Mode` as live-backed.
- The verifier checks for an honest knight-checkmate receipt instead of fake success copy.

## Implementation

- Added `src/lib/knightmare-mode.ts` with:
  - Lichess NDJSON latest-game normalization.
  - UCI move replay sufficient to identify the final moving piece.
  - deterministic `evaluateKnightmareMode()` rules.
  - fallback fixtures for signed-out / no-username review flows.
- Added `tests/knightmare-mode-fixtures.mjs`.
- Wired `src/app/actions.ts` active challenge checks to the live Knightmare verifier.
- Updated `src/lib/verifier-status.ts` so Knightmare Mode is `live`.

## Verification

Local:

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke on `localhost:3011`:
  - `/verifiers` 200 and contains `Knightmare Mode` + `Live-backed` ✅
  - `/challenges/knightmare-mode` 200 ✅
  - `/account` 200 ✅
  - `/api/og/dare/knightmare-mode` 200 ✅

Production:

- `vercel --prod --yes` ✅
- Deployment: `https://cc-ndyrk85qn-andreas-nordenadlers-projects.vercel.app`
- Aliased to: `https://sidequestchess.com` ✅
- Production smoke:
  - `https://sidequestchess.com/verifiers` 200 and contains `Knightmare Mode` + `Live-backed` ✅
  - `https://sidequestchess.com/challenges/knightmare-mode` 200 ✅
  - `https://sidequestchess.com/account` 200 ✅
  - `https://sidequestchess.com/api/og/dare/knightmare-mode` 200 ✅
- Vercel production error-log scan: `No logs found for andreas-nordenadlers-projects/cc on branch main` ✅

## Notes

This makes four starter-deck challenges live-backed: Queenless, No Castle Club, Pawn Storm Maniac, and Knightmare Mode. Remaining specified-only verifier candidates: The Blunder Gambit, Rookless Rampage, and One Bishop to Rule Them All.
