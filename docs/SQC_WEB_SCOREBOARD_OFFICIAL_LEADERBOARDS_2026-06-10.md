# SQC Web Scoreboard Official Leaderboards — 2026-06-10

## Slice

Closed a website parity gap where mobile-v251 had an `Official Leaderboards` surface, while website `/scoreboard` still showed a blurred coming-soon placeholder.

## Shipped

- Replaced the `/scoreboard` placeholder with a live official leaderboard hub.
- Added current official Multiplayer leaderboard rows.
- Added latest final official results with winner context when available.
- Added an older weekly archive grouped by official event week.
- Linked every row to the corresponding Multiplayer detail/final leaderboard page.
- Kept the existing website card/button/leaderboard visual language; no redesign.
- Kept private invite-only tables, invite codes, participant emails, and account metadata hidden by using public official Multiplayer tables only.

## Verification

- `pnpm lint -- src/app/scoreboard/page.tsx`
- `pnpm build`

## Production smoke

Production deploy: `https://cc-42s3rjsiv-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`.

- `https://sidequestchess.com/scoreboard?officialScoreboardSmoke=20260610` returned 200 with `Official Leaderboards`, `Current week`, `Previous week`, and `Archive`.
- `https://cc-42s3rjsiv-andreas-nordenadlers-projects.vercel.app/scoreboard?officialScoreboardSmoke=20260610` returned 200 with the same official leaderboard sections.
- `https://sidequestchess.com/groupquests/public?status=finished&officialScoreboardSmoke=20260610` returned 200 with `Official SQC Multiplayer archive`.
