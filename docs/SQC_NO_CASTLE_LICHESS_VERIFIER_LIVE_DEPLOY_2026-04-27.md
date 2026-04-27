# SQC No Castle Club Lichess Verifier — Live Deploy Proof

Date: 2026-04-27 18:44 Europe/Stockholm  
Owner: Sam

## What changed

- Added a real rule-backed `No Castle Club` verifier for Lichess latest-game checks.
- The verifier normalizes Lichess UCI move history and detects player castling via `e1g1`, `e1c1`, `e8g8`, and `e8c8`.
- Active challenge checks now use the live Lichess verifier for `No Castle Club` when a Lichess username is saved, with deterministic fixture fallback when no username is present.
- The public verifier status board now marks `No Castle Club` as live-backed instead of next-adapter.

## Verification

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy: `vercel --prod --yes` ✅ (`https://cc-9859r9iq9-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`)
- Production smoke ✅
  - `https://sidequestchess.com/verifiers` returned Side Quest Chess content with `No Castle Club` and `Live-backed`.
  - `https://sidequestchess.com/challenges/no-castle-club` returned Side Quest Chess content with `No Castle Club` and `Live-backed`.
  - `https://sidequestchess.com/rules` returned Side Quest Chess content with `No Castle Club` and `Live-backed`.
  - `https://sidequestchess.com/account` returned HTTP 200.
  - `https://sidequestchess.com/api/og/dare/no-castle-club` returned HTTP 200 `image/png`.
  - Vercel production `500` log scan for the last 30m returned no logs.

## Files changed

- `src/lib/no-castle-club.ts`
- `tests/no-castle-club-fixtures.mjs`
- `src/app/actions.ts`
- `src/lib/verifier-status.ts`

## Notes

This moves the second starter-deck challenge from product-spec honesty into a real latest-game verifier. The remaining specified-only challenges still avoid fake success claims.

## Deployed URL

- Canonical: https://sidequestchess.com/verifiers
- No Castle detail: https://sidequestchess.com/challenges/no-castle-club
