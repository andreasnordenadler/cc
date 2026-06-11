# SQC web Trophy Cabinet receipt polish — 2026-06-11

Sprint: SQC website UX parity review 24h  
Slice: Account Trophy Cabinet / proof receipts visual polish

## What changed

- Added a compact Trophy Cabinet summary strip for sealed Solo coats, saved proof receipts, and Multiplayer podium scrolls.
- Upgraded completed official Solo cards with an inline SQC-styled `Receipt` panel showing proof provider/game context and safe proof summary before the share/open actions.
- Upgraded completed Custom Solo cards with the same receipt treatment so account proof history feels deliberate instead of a loose text stack.
- Grouped receipt/share actions into a calmer action row while preserving existing public proof links, Custom Solo account handoff, and Trophy Cabinet behavior.

## Product/UX notes

- Keeps the established SQC trophy-case tone and tavern-card styling.
- Does not add or release any live/pickable quest.
- Does not touch Capaflow, Lyric Logic, LoLite, or other projects.

## Checks

- `pnpm lint -- src/app/account/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`

## Deployment / smoke

Pending production deploy and live smoke in this slice.
