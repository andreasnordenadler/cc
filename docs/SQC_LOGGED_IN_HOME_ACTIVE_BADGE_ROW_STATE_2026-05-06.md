# SQC logged-in homepage active badge row state — 2026-05-06

## User request

Andreas sent a logged-in homepage screenshot and said that if any quest in the badge row is the current active quest, it should show the Active Quest stamp and green outline.

## Change

Updated `src/app/page.tsx` and `src/app/globals.css` so the homepage coat-of-arms/badge row compares each preview quest with the signed-in user's active quest. Matching badges now render:

- the existing `ACTIVE QUEST` stamp, scaled for the badge row;
- a green outline and subtle green glow around the badge link.

Signed-out homepage behavior remains unchanged.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
