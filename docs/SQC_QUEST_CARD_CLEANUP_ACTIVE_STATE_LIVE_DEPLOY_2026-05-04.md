# SQC quest card cleanup + active state live deploy — 2026-05-04

## Change

Andreas requested the quest hub cards remove the bottom alternative/badge tag line (for example “Horse First Initiate”, “Diagonal Daycare Pass”, “Tiny Royal Walk”), remove the visible per-card “Open quest”/quest CTA text, and make the active quest state much clearer.

Implemented on `src/app/challenges/page.tsx` and `src/app/globals.css`:

- Removed `challenge.badge` from the quest card footer.
- Removed the visible card footer quest link text from each quest card.
- Removed the small low-contrast yellow active badge from the card badge row.
- Added a high-contrast `Active quest` callout plus green border/glow styling for the active quest card.

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed.
- Production deploy — passed: `https://cc-rexfs6xat-andreas-nordenadlers-projects.vercel.app`.
- Alias — passed: `https://sidequestchess.com`.
- Live smoke for `/challenges` — HTTP 200 on both production alias and deployment URL.
- Live HTML smoke confirmed `Open quest`, `Horse First Initiate`, `Diagonal Daycare Pass`, `Tiny Royal Walk`, and `Continue quest` are absent from the `/challenges` response.
