# SQC logged-in active quest coat centering — 2026-05-06

## User request

Andreas asked to move the active quest coat of arms a bit more toward the center, centered within the space to the right of the text content.

## Change

Updated `src/app/globals.css` so the active quest card coat art sits farther inward from the right edge and the text content reserves a wider right-side area. This centers the coat more naturally in the visual space right of the copy.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
