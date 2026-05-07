# SQC challenges completed/active state fix — 2026-05-07

## Report
Andreas reported that the Side Quest page did not update to show that Any Game Counts had been finalized/completed.

## Root cause
The quest deck treated the stored `activeChallenge.id` as active even after that same quest was completed. The card component also hid the completed award when a quest was both active and completed (`completed && !active`). That meant a completed current quest could still visually read as active/in-progress instead of completed.

## Change
- `/challenges` now only passes an active quest id to the deck if the active quest is not already completed.
- `ChallengeCard` now displays the completed award whenever `completed` is true.
- The active stamp is now suppressed for completed cards.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
