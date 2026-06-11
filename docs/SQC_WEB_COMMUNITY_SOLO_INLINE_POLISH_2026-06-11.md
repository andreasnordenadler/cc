# SQC Web Community Solo inline polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint on Community Solo browse usability and visible polish.

## What changed
- Reworked the Community Solo discovery controls into an SQC-styled `Find your next run` panel with clearer search/filter copy and quick filter chips.
- Added inline `Rule preview` blocks to Community Solo cards so runners can understand the proof condition before opening detail pages.
- Grouped card CTAs under a calm `Next step` action panel, separating inspect/start actions from player shelf/report links.
- Preserved existing Community Solo data boundaries, account handoff behavior, verifier paths, and SQC visual language.

## Proof
- `pnpm lint -- src/app/challenges/community/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm quest:release-gate` via `pnpm deploy:prod`
- committed/pushed `358412b`
- production deploy `https://cc-j7zbysi5y-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- live smoke returned 200 for production and deploy `/challenges/community?inlinePolishSmoke=20260611b` with `Find your next run`, `Rule preview`, and `Next step`
- live smoke returned 200 for production `/groupquests/public?inlinePolishSmoke=20260611b` with Public Multiplayer content

## Files
- `src/app/challenges/community/page.tsx`
- `src/app/globals.css`
