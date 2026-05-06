# SQC proof arrival loop review — 2026-05-06

## Scope
Andreas asked for a quick product pass on what should happen when proof comes in: completed quests should clearly become completed, users should see celebration, proof should be available, and proof should be shareable.

## Changes made

- `/result` now supports quest-specific victory proof via `?challengeId=...` and prefers the latest passed receipt instead of blindly showing the latest global attempt.
- Completed quest CTAs now point directly to `/result?challengeId=<quest>` so a later pending/failed attempt does not hide a previous victory.
- Proof receipt compaction now preserves the latest passed proof per completed quest while still trimming recent noisy checks to avoid Clerk metadata overflows.
- My Quest Log now includes the actual `Check latest games` action on the current quest card when the quest is active and incomplete.
- My Quest Log switches completed active quests to proof actions: `View victory proof` and `Proof log`.
- Proof Log `Check latest games` now routes to the active quest page instead of `/account`.
- Proof Log passed receipts now link to the quest-specific victory proof.
- Coat of Arms collection surfaces now use real completion progress for signed-in users instead of making everything appear earned.
- Logged-in homepage badge/active quest art now uses real completion state; signed-out homepage preview behavior is intentionally preserved.

## Verification

- `pnpm lint` passed with only the existing accepted warnings.
- `pnpm build` passed.

## Review notes

The remaining larger improvement is proof-board data fidelity: the UI has a board/proof area, but most verifier paths do not yet persist final FEN / last move data. I left that as a future verifier-data task rather than faking it in this pass.
