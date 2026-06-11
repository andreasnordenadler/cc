# SQC Web Multiplayer sample room polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint by polishing the legacy Multiplayer sample room at `/groupquests/gq_demo_no_castle_01` so it no longer feels like a stale prototype with unsupported controls.

## User-visible changes
- Reframed the page as a sample Multiplayer table that explains the live flow without pretending to submit proof directly.
- Replaced the old fake `Submit game link` / `Explain rejected proof` buttons with real next steps to live public tables and proof rules.
- Added a clear `Next step` panel pointing runners to live tables.
- Expanded participant proof requirements with short player-facing explanations.
- Added `Proof choices` copy for fastest latest-game checks and leaderboard receipt trails.
- Cleaned remaining lowercase/internal-feeling Multiplayer wording into SQC account/table/receipt language.

## Checks
- `pnpm lint -- src/app/groupquests/gq_demo_no_castle_01/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Commit / deploy
- Commit: `d61cc8a` (`Polish multiplayer sample room UX`)
- Production deploy: `https://cc-e3pw5hkku-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Live smoke
- `https://sidequestchess.com/groupquests/gq_demo_no_castle_01?sampleRoomSmoke=20260611` returned 200 with `Use the live table list`, `Proof choices`, and `Join a live table`.
- Deploy URL for the same route returned 200 with the same expected copy.
- `https://sidequestchess.com/groupquests/public?sampleRoomSmoke=20260611` returned 200 with `Public Multiplayer` and `Find a table`.
