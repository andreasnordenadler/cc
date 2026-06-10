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

To run after deploy:

- `/scoreboard?officialScoreboardSmoke=20260610` should show `Official Leaderboards`, `Current week`, `Previous week`, and `Archive`.
- `/groupquests/public?status=finished&officialScoreboardSmoke=20260610` should still expose final official Multiplayer archive rows.
