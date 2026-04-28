# SQC Early King Walk Lichess verifier live deploy — 2026-04-28

## Summary

Promoted `Early King Walk` from specified-only to a live-backed Lichess latest-game verifier.

The beginner starter trio is now fully honest/live-backed on Lichess:

- `Knights Before Coffee`
- `Bishop Field Trip`
- `Early King Walk`

## Product impact

- `/verifiers` now marks `Early King Walk` as `Live-backed`.
- `/challenges/early-king-walk` now presents automated verifier support instead of specified-only framing.
- `/account` can create pass/fail/pending receipts for the third beginner quest when a Lichess username is saved.
- The private/friends beta path is clearer because all beginner starter quests now have live Lichess verification.

## Implementation

- Added `src/lib/early-king-walk.ts`.
- Added fixture and normalizer coverage in `tests/early-king-walk-fixtures.mjs`.
- Wired `early-king-walk` into active challenge latest-game checking in `src/app/actions.ts`.
- Updated `src/lib/verifier-status.ts` from specified-only to live-backed.

Verifier rules:

- Standard chess only.
- Bullet/blitz/rapid/unknown v1 eligibility, matching other beginner Lichess adapters.
- Player must win.
- A non-castling king move must happen before the player’s move 12.
- Castling is explicitly tracked but does not count as the king walk.

## Verification

Local verification:

- `pnpm exec node --experimental-strip-types --test tests/early-king-walk-fixtures.mjs` ✅
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ (`24` tests passed)
- `pnpm lint` ✅
- `pnpm build` ✅

Production deploy:

- `vercel --prod --yes` ✅
- Deployment: `https://cc-ibigalde1-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com` ✅

Production smoke:

- `https://sidequestchess.com/verifiers` returned `200` and contained `Early King Walk`, `Live-backed Lichess latest-game verifier`, and `non-castling king move` ✅
- `https://sidequestchess.com/challenges/early-king-walk` returned `200` and contained `Early King Walk`, `Live-backed`, and `Castling does not count` ✅
- `https://sidequestchess.com/account` returned `200` and contained `Early King Walk` and `Live-backed` ✅
- `https://sidequestchess.com/path` returned `200` ✅
- Bounded Vercel deployment log watch showed no error-like lines ✅

## Notes

An initial local log-watch attempt used `timeout`, which is not installed in this macOS environment. Re-ran the same bounded watch using a shell background process plus `sleep`/`kill`; verification passed.
