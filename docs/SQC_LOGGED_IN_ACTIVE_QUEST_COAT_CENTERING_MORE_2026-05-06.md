# SQC logged-in active quest coat centering follow-up — 2026-05-06

## User request

Andreas sent a follow-up screenshot and asked for the active quest coat of arms to move inward more.

## Change

Updated `src/app/globals.css` to shift the active quest coat further left from the card edge and increase the reserved right-side content area, making the coat sit closer to the center of the empty right panel.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
