# SQC Chess.com Queen? Never Heard of Her adapter live deploy — 2026-04-28

## Summary
Promoted `Queen? Never Heard of Her` from Lichess-only to dual-host Lichess + Chess.com latest-game verification.

## What changed
- Added Chess.com PGN/SAN capture normalization for the queenless verifier path.
- Wired `/account` latest-game checks so a saved Chess.com username can verify `Queen? Never Heard of Her` when no Lichess username is present.
- Updated verifier status and private-beta copy to show 5 dual-host quests.
- Added fixture coverage for Chess.com queen-loss pass/fail behavior.

## Verification
- `pnpm exec node --experimental-strip-types --test tests/chesscom-queen-never-heard-of-her-fixtures.mjs` ✅
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ — 33 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅
- Direct Chess.com adapter smoke with Andreas test account `and72nor` ✅ — normalized latest public game and returned an honest failed receipt because the player did not win.
- Production deploy ✅ — `https://cc-qnhwq9wkt-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke ✅ — `/verifiers`, `/beta`, `/challenges/queen-never-heard-of-her`, and preview `/verifiers` returned 200 and contained the new dual-host/5-quest copy.
- Bounded Vercel log watch ✅ — no `error`, `exception`, or `500` strings appeared during the 20s post-deploy watch.

## Live URLs checked
- https://sidequestchess.com/verifiers
- https://sidequestchess.com/beta
- https://sidequestchess.com/challenges/queen-never-heard-of-her
- https://cc-qnhwq9wkt-andreas-nordenadlers-projects.vercel.app/verifiers

## Notes
The private-beta verifier lane now has five dual-host latest-game quests: the three beginner quests, `No Castle Club`, and `Queen? Never Heard of Her`.
