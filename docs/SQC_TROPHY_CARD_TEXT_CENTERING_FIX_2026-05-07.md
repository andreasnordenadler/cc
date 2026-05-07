# SQC trophy card text centering fix — 2026-05-07

## Request
Andreas showed that the trophy card text under the quest name still was not centered.

## Root cause
The trophy card is still a specialized version of the generic completed-quest list item, so generic `span`/`strong` rules were still influencing child layout and alignment.

## Change
- Changed `.trophy-card-copy` to a full-width flex column.
- Explicitly centered and normalized width/overflow/white-space on nested `strong`, `em`, and `span` elements.
- Removed ellipsis/overflow behavior from the trophy-card title so the subtitle aligns to the card center instead of inherited list text behavior.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
