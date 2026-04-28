# SQC Blunder Gambit Lichess verifier live deploy — 2026-04-28

## What shipped

Promoted `The Blunder Gambit` from specified-only to a live-backed Lichess latest-game verifier.

The verifier now checks:
- standard chess only
- bullet/blitz/rapid eligibility
- minimum 15-move game length
- player win
- player knight/bishop/rook captured by move 10
- no equal-or-better material won back on the immediate reply

## Files changed

- `src/lib/the-blunder-gambit.ts`
- `tests/the-blunder-gambit-fixtures.mjs`
- `src/app/actions.ts`
- `src/lib/verifier-status.ts`

## Verification

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs tests/rookless-rampage-fixtures.mjs tests/one-bishop-to-rule-them-all-fixtures.mjs tests/the-blunder-gambit-fixtures.mjs` ✅ — 16/16 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅ — `https://cc-op1r9vtsq-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`
- Production smoke ✅:
  - `https://sidequestchess.com/verifiers` returned 200 and contained `The Blunder Gambit` + `Live-backed`
  - `https://sidequestchess.com/challenges/the-blunder-gambit` returned 200 and contained `The Blunder Gambit` + `Live-backed`
  - `https://sidequestchess.com/account` returned 200 and contained `latest game` + `Side Quest Chess`
  - `https://sidequestchess.com/api/og/dare/the-blunder-gambit` returned 200 `image/png`
- Vercel production error-log scan ✅ — `0` error log lines in the last 30 minutes

## Impact

All seven starter-deck challenges now have live-backed Lichess latest-game verifier status instead of leaving `The Blunder Gambit` as the final specified-only challenge.
