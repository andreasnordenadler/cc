# SQC Chess.com final-position proof receipts — 2026-05-09

## Scope

Follow-through on the reconfirmed final proof-position/chessboard loop. The existing board UI and Lichess receipt metadata were already in place; this slice extends the same receipt metadata path to Chess.com Any Game / win / draw / loss manual and latest-game checks.

## Change

- Chess.com verification verdicts can now carry `finalPositionFen` and `lastMoveUci`.
- Added PGN/SAN-to-board proof extraction using the existing Chess.com SAN parsing board model.
- Passed final-board metadata through successful Chess.com manual game verification.
- Passed final-board metadata through successful Chess.com latest finished-game checks, including activation-time auto-check receipts.

## User-visible effect

When a completed quest receipt comes from Chess.com and the public PGN can be parsed, the existing completed-quest proof board can render the final position and highlight the last move instead of falling back to the scroll-only receipt.

If Chess.com PGN parsing is unavailable or ambiguous, the verifier still passes/fails normally and simply omits board metadata rather than blocking quest completion.

## Verification

- `pnpm lint` passed with 3 pre-existing warnings.
- `pnpm build` passed.
