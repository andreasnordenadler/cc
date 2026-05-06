# SQC logged-in Active Quest card simplification — 2026-05-06

## User request

Andreas asked for the logged-in homepage card to:

- say `Active Quest` instead of `Current Run`;
- include the active quest Coat of Arms;
- remove `Completed quests`;
- remove the points pill;
- remove `Review active rules`;
- make clicking the section open the active quest page.

## Change

Updated `src/app/page.tsx` and `src/app/globals.css` so the signed-in homepage Active Quest card is a full-card link to `/challenges/[activeQuestId]` when a quest is active, includes the active coat-of-arms art, and no longer shows completed quest count, points, or the secondary rules button.

Signed-out homepage behavior remains unchanged.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
