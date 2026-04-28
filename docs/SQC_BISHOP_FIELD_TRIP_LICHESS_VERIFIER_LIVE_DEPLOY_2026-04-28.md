# SQC Bishop Field Trip Lichess Verifier Live Deploy — 2026-04-28

## Burst

Promoted `Bishop Field Trip` from specified-only beginner quest to a live-backed Lichess latest-game verifier as part of the friends/private beta hardening lane.

## Changed

- Added `src/lib/bishop-field-trip.ts` with:
  - normalized Lichess latest-game UCI parsing
  - player side detection
  - original bishop tracking from home squares (`c1`/`f1` or `c8`/`f8`)
  - queen-first failure detection
  - win, standard chess, and bullet/blitz/rapid eligibility checks
- Added `tests/bishop-field-trip-fixtures.mjs` for deterministic pass/fail and normalizer coverage.
- Wired `/account` latest-game checking through `checkLatestLichessBishopFieldTrip` with fixture fallback when no Lichess username is saved.
- Updated verifier status so `/verifiers`, `/account`, and challenge surfaces mark Bishop Field Trip as `Live-backed`.

## Verification

- `pnpm exec node --experimental-strip-types --test tests/bishop-field-trip-fixtures.mjs` ✅
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ — 20/20 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
  - Deployment: `https://cc-1jcho73px-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/verifiers` → HTTP 200 ✅
- `https://sidequestchess.com/challenges/bishop-field-trip` → HTTP 200 ✅
- `https://sidequestchess.com/account` → HTTP 200 ✅
- `https://sidequestchess.com/path` → HTTP 200 ✅
- Production string checks confirmed `Bishop Field Trip`, `Live-backed`, and bishop/queen rule copy on live surfaces ✅
- Bounded Vercel log watch for the new deployment showed no fresh runtime error output during the watch window ✅

## Notes

This leaves `Early King Walk` as the remaining specified-only beginner quest verifier before the beginner starter path is fully live-backed.
