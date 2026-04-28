# SQC Chess.com Pawn Storm Maniac adapter live deploy — 2026-04-28

## Summary
Promoted `Pawn Storm Maniac` from Lichess-only to dual-host Lichess + Chess.com latest-game verification.

## What changed
- Added Chess.com PGN/SAN pawn-move normalization for the Pawn Storm Maniac verifier path.
- Wired `/account` latest-game checks so a saved Chess.com username can verify `Pawn Storm Maniac` when no Lichess username is present.
- Updated verifier status plus `/verifiers`, `/beta`, and `/connect` private-beta copy to show 6 dual-host quests.
- Added fixture coverage for Chess.com six-pawn pass behavior and five-pawn fail behavior.

## Verification
- `pnpm exec node --experimental-strip-types --test tests/chesscom-pawn-storm-maniac-fixtures.mjs` ✅ — 2 tests passed
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ — 35 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅
- Direct Chess.com adapter smoke with Andreas test account `and72nor` ✅ — normalized latest public game and returned an honest failed receipt because the player did not win.
- Production deploy ✅ — `https://cc-eymu2qqpx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke ✅ — `/verifiers`, `/beta`, `/connect`, `/challenges/pawn-storm-maniac`, and preview `/verifiers` returned 200 and contained the new dual-host/6-quest/Pawn Storm copy.
- Vercel production error-log scan ✅ — `No logs found for andreas-nordenadlers-projects/cc`.

## Live URLs checked
- https://sidequestchess.com/verifiers
- https://sidequestchess.com/beta
- https://sidequestchess.com/connect
- https://sidequestchess.com/challenges/pawn-storm-maniac
- https://cc-eymu2qqpx-andreas-nordenadlers-projects.vercel.app/verifiers

## Notes
The private-beta verifier lane now has six dual-host latest-game quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, and `Pawn Storm Maniac`.
