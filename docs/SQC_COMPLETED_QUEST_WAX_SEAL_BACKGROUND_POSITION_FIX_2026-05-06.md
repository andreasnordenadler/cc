# SQC completed quest wax seal background and position fix — 2026-05-06

## Scope
Andreas said the wax seal was better, but the black/grey matte background needed to be removed and the seal should sit to the right over part of the quest name text instead of covering the quest coat of arms.

## Changes made

- Created `public/stamps/quest-complete-premium-red-wax-sqc-v10.png` by removing the dark matte background from the wax seal asset while keeping the red wax edge clean.
- Updated completed quest CSS to use the transparent v10 seal asset.
- Repositioned the completed quest award seal away from the quest coat-of-arms image and toward the right side of the quest title/text area.
- Reduced the completed quest title padding so the seal can overlap the title area rather than reserving too much empty space.

## Verification

- Visual preview confirmed no visible black/grey rectangle or halo on a dark background.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
