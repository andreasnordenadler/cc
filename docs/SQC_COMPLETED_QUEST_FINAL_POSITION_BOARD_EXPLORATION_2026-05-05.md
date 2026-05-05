# SQC completed quest final-position board exploration — 2026-05-05

## Shipped

- Added `ProofPositionBoard`, a reusable final-proof board component for completed quest receipts.
- Extended saved `ChallengeAttempt` metadata typing with optional `finalPositionFen`, `lastMoveUci`, and `lastMoveSan` fields.
- Wired the board into passed proof-log receipts and completed quest detail pages.
- Current behavior is honest: existing receipts without stored FEN show a pending board slot instead of inventing a fake position; future verifier work can populate FEN + last move and the board will render automatically with from/to highlights.

## Why this shape

- The board belongs to completed proof, not general quest browsing.
- Text receipts remain primary until verifiers store exact final positions.
- The UI can support Lichess and Chess.com equally because FEN + UCI/SAN is provider-neutral.

## Verification

- `pnpm lint` — passed with existing warnings only (`deploy-production-guard.mjs` unused variable, `site-nav.tsx` img optimization warning).
- `pnpm build` — passed.

## Next implementation hook

Populate `finalPositionFen` and `lastMoveUci`/`lastMoveSan` from each latest-game verifier once normalized move replay is centralized across Lichess and Chess.com.
