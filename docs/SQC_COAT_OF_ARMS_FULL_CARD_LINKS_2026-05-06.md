# SQC Coat of Arms full-card links — 2026-05-06

## User request

Andreas asked that on the Coat of Arms page each quest card should be clickable, not only the coat-of-arms image.

## Change

Updated `src/app/badges/page.tsx` so every Coat of Arms meaning card is now a full-card `Link` to its quest page. Updated `src/app/globals.css` hover/focus styling so the whole card behaves like an interactive target.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
