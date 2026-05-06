# SQC completed quest wax seal transparent right placement — 2026-05-06

## Scope
Andreas shared a screenshot showing the wax seal still had a black/grey matte block and was too large/central, covering the quest coat of arms. He asked for the background to be removed and for the seal to sit to the right, covering part of the quest name text instead.

## Changes made

- Created `public/stamps/quest-complete-premium-red-wax-sqc-v11.png` with a stricter alpha mask from the premium wax render so the black/grey matte is removed.
- Updated CSS to reference the cache-busted v11 transparent seal asset.
- Reduced the seal size.
- Repositioned the seal toward the right side of the quest title/text area and away from the coat-of-arms reward image.
- Adjusted the mobile placement to keep the seal top-right rather than centered over the reward art.

## Verification

- Visual preview confirmed no visible square matte on a purple/card-like background.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
