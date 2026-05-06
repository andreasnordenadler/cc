# SQC logged-in Active Quest two-column layout — 2026-05-06

## User request

Andreas noted that moving the coat of arms inward made the text area too compact and asked to change the section layout to use the space better.

## Change

Updated `src/app/globals.css` so the logged-in Active Quest card uses a true two-column CSS grid:

- left column: title, chess-account meta, and explanatory copy;
- right column: centered active quest coat of arms;
- mobile: stacked one-column layout.

This removes the previous right-padding/absolute-positioning hack, so the text can breathe while the coat stays visually centered in its own area.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
