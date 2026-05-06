# SQC Lichess proof-board data — 2026-05-06

## Scope
Follow-up autonomous pass after proof-arrival loop work: completed proof should become richer actual evidence instead of a purely textual receipt where verifier data is available.

## Changes made

- Added `src/lib/chess-proof.ts`, a small local UCI move applier that turns standard chess UCI move lists into final FEN plus last move.
- Updated Lichess finished-game verification to request move data from the latest-game API.
- Updated Lichess manual/finished/draw/loss/win verification paths to attach final-position proof data on passed results when Lichess provides UCI moves.
- Updated challenge attempt persistence to store `finalPositionFen`, `lastMoveUci`, and `lastMoveSan` when verifiers return those fields.
- Existing proof-board UI now automatically renders the final board and highlights the last move for newly completed Lichess-backed receipts.

## Deliberate boundaries

- No fake board data was generated.
- Chess.com proof-board data was not added in this pass because Chess.com provides PGN/SAN rather than a UCI move list in the current adapter, and SAN-to-FEN needs a separate parser or dependency decision.
- Existing historical completed receipts will only show board data if they already have FEN fields; new Lichess-backed passed receipts can carry the board proof.

## Verification

- `pnpm lint` passed with only the existing accepted warnings.
- `pnpm build` passed.
