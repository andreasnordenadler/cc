# SQC website official leaderboards screen parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`, `OfficialMultiplayerLeaderboardsScreen`.

## Slice

- Aligned `/leaderboards` and `/scoreboard` hero heading with the mobile screen title: `Official Leaderboards.`
- Matched the signed-in explanatory copy to the mobile official leaderboard screen: three weekly official Multiplayer Side Quests, live race, final weekly results.
- Matched the signed-out explanatory copy to the mobile signed-out state: sign in to see active official weekly leaderboards, final results, and archive.
- Renamed the first data lane from `Active now` / `Official leaderboards currently open` to the mobile structure `Current week` / `Active official leaderboards`.

## Existing coverage retained

- Current official rows still link to `/groupquests/[id]` for join/proof/leaderboard detail.
- Previous week rows still expose final receipts.
- Archive rows still group older official weeks with links to final leaderboard detail pages.
- `/leaderboards` remains a route alias for `/scoreboard`.

## Verification

- `pnpm build` passed on 2026-07-06. Next.js still reports the existing workspace-root inference warning because multiple lockfiles are present.
