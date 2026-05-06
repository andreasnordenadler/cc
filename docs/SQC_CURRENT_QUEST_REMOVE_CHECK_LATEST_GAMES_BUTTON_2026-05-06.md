# SQC current quest remove Check latest games button — 2026-05-06

## Scope
Andreas shared a My Side Quests screenshot and asked to remove the `Check latest games` button from the Current Quest card.

## Changes made

- Removed the incomplete-active-quest `Check latest games` form/button from `src/app/account/page.tsx`.
- Kept completed-state proof actions (`View victory proof`, `Proof log`) intact.
- Removed the now-unused `checkActiveChallenge` import from the account page.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
