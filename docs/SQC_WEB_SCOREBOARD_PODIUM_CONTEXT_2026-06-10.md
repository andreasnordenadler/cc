# SQC Web Scoreboard Podium Context — 2026-06-10

## Slice

Continued website parity for mobile-v251 Official Leaderboards by adding visible top-three podium context directly to `/scoreboard` official leaderboard rows.

## What changed

- Website `/scoreboard` current, previous, and archive official rows now show Gold/Silver/Bronze mini podium rows when public official table participants have positive score or verified quest proof.
- Podium rows include leaderboard display name, points, and verified quest count.
- The detail page link remains the canonical route for full leaderboard/proof inspection.
- Private invite-only tables, emails, invite codes, account metadata, and raw proof/config data remain hidden.
- Styling reuses the existing official scoreboard row/card treatment and does not redesign the page.

## Verification

- `pnpm lint -- src/app/scoreboard/page.tsx`
- `pnpm build`
- Commit: `9bc0335` (`Add scoreboard podium context`)
- Production deploy: `https://cc-339ucu581-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/scoreboard?podiumContextSmoke=20260610` returned 200 and contained `Official Leaderboards`, `Gold`, and `verified`.
  - `https://cc-339ucu581-andreas-nordenadlers-projects.vercel.app/scoreboard?podiumContextSmoke=20260610` returned 200 and contained `Official Leaderboards`, `Gold`, and `verified`.
  - `https://sidequestchess.com/groupquests/public?podiumContextSmoke=20260610` returned 200 as a neighboring public Multiplayer smoke.
