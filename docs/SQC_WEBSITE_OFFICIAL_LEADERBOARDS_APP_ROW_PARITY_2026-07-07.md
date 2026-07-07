# SQC website Official Leaderboards app-row parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `OfficialMultiplayerLeaderboardsScreen`.

## Change

- Added a mobile screen-map section to `/leaderboards`, `/scoreboard`, and `/official-leaderboards`.
- The screen now exposes the same three app-row lanes as mobile before the fuller web leaderboard tables:
  - Current week / Active official leaderboards
  - Previous week / Latest final results
  - Archive / Browse older official weeks
- Archive rows now have stable anchors so the app-row archive shortcut can jump into the first available archived week.
- Existing official leaderboard data loading, group quest detail links, proof/account logic, and route aliases were preserved.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing multiple-lockfile workspace-root warning.
- Local render smoke attempted with `pnpm start --hostname 127.0.0.1 --port 3021`; requesting `/official-leaderboards` returned `500 Internal Server Error` with Clerk headers `x-clerk-auth-reason: dev-browser-missing` and `x-clerk-auth-status: signed-out`, so no clean local screenshot was captured in this slice.

## Notes

- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
