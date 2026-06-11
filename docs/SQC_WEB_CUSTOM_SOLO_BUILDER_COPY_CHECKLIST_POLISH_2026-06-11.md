# SQC Web Custom Solo builder copy/checklist polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint on the flagged Custom Solo builder surface.

## What changed
- Replaced harsher library/hero wording like “suspicious shelf” and “saved bad ideas” with player-facing Custom Solo shelf/recipe language.
- Renamed save-state choices to clearer player actions: `Draft (private)`, `Playable privately`, and `Publish to Community Solo`.
- Added an SQC-styled builder quality checklist between the creation guide and form so runners see the product expectation before filling six proof slots.
- Kept the existing SQC visual treatment, verifier behavior, lifecycle values, and private/public data boundaries unchanged.

## Proof
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`

## Files
- `src/app/account/custom-side-quests/page.tsx`
- `src/app/globals.css`
