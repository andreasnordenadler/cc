# SQC logged-in heroism-card active quest state — 2026-05-06

## User request

Andreas pointed out that the `How heroic are you feeling today?` quest-choice cards can also contain the current active quest.

## Change

Updated `src/app/page.tsx` and `src/app/globals.css` so signed-in homepage heroism cards compare each card's quest with the active quest. Matching cards now show:

- green active outline/glow;
- the existing `ACTIVE QUEST` stamp, scaled for the card.

Signed-out homepage behavior remains unchanged.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
