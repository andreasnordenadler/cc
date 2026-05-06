# SQC completed proof victory receipt polish — 2026-05-06

## Scope
Andreas agreed the `Completed Proof` section should become a polished user-facing victory proof section instead of showing internal placeholder copy such as `Chessboard proof slot is ready` and `Last move: not captured yet`.

## Changes made

- Renamed the completed proof section headline to `Victory proof is ready.`
- Added an accepted status badge in the section header.
- Reworked `ProofPositionBoard` into a victory receipt component:
  - If final board data exists, it shows `Final position captured.` with the board and last move.
  - If final board data is missing, it shows `Quest proof accepted.` with a polished accepted-receipt fallback instead of an empty board/dev placeholder.
  - Shows receipt facts: quest, receipt/game, and last move status.
  - Adds `Copy victory proof` and `Share victory proof` actions with quest-specific `/result?challengeId=...` link.
- Removed developer-facing language about `next verifier pass` and `proof slot is ready`.
- Added styling for receipt facts and the accepted-proof fallback card.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
