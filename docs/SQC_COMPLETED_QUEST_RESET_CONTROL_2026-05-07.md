# SQC completed quest reset control — 2026-05-07

## Request
Andreas asked for a button that lets users reset a completed quest so they can do it again, with a warning/confirmation that the reset cannot be undone.

## Change
- Added `Reset quest` to completed quest proof details on `/challenges/[id]`.
- The button opens a confirmation dialog before any destructive change happens.
- Confirmation copy explicitly says the saved completion, proof receipt, coat of arms unlock, and points for that quest will be removed and that the action cannot be undone.
- Added `resetCompletedChallenge` server action.
- Reset behavior:
  - removes the quest id from `challengeProgress.completedChallengeIds`,
  - recalculates completed count and reward points,
  - removes saved attempts/proof receipts for that quest,
  - clears the active quest slot if it points to the reset quest,
  - revalidates account, badges, hub, detail, result, and homepage paths.
- Also corrected completed quest sharing on the challenge detail page to use the user-specific public proof URL instead of the generic homepage link.

## Verification
- `pnpm lint` passed with pre-existing warnings only.
- `pnpm build` passed.
