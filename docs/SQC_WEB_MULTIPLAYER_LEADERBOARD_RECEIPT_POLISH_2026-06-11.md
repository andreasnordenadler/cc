# SQC Web Multiplayer leaderboard receipt polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint by polishing the signed-in Multiplayer leaderboard area.

## User-facing changes
- Reframed the leaderboard section as `Leaderboard and proof receipts` so players understand rows are more than ranking noise.
- Added compact SQC-styled summary cards for current leader, the signed-in player's run, and full clears.
- Turned expanded player rows into clearer proof receipts with verified count and final-clear context before the per-quest finish trail.
- Fixed the winner scroll copy so it uses the actual Multiplayer Side Quest name instead of hard-coded `No Castle Night`.
- Preserved existing verifier, join, host removal, leaderboard sorting, seal, and scroll behavior.

## Checks
- `pnpm lint -- 'src/app/groupquests/[id]/page.tsx' src/components/group-quest-leaderboard.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` (includes `pnpm quest:release-gate`)

## Deploy
- Production deploy: `https://cc-hdzk810yg-andreas-nordenadlers-projects.vercel.app`
- Aliased to: `https://sidequestchess.com`

## Live smoke
- `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?leaderboardReceiptSmoke=20260611` → 200 Multiplayer content
- `https://cc-hdzk810yg-andreas-nordenadlers-projects.vercel.app/groupquests/seed-public-sqcseed11-11?leaderboardReceiptSmoke=20260611` → 200 Multiplayer content
- `https://sidequestchess.com/groupquests/public?leaderboardReceiptSmoke=20260611` → 200 Public Multiplayer content
- `https://sidequestchess.com/challenges/community?leaderboardReceiptSmoke=20260611` → 200 Community Solo content

Note: the exact polished leaderboard receipt panel is on the signed-in accepted-participant state, so the live smoke verifies the deployed Multiplayer routes without mutating production participant data.
