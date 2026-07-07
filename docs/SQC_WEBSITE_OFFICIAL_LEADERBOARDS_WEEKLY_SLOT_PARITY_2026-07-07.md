# SQC website Official Leaderboards weekly slot parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, `OfficialMultiplayerLeaderboardsScreen`.

## Change

- Added a `Weekly official set` section to the web Official Leaderboards route.
- The section exposes the mobile app framing that three official Multiplayer Side Quests run each week: `Easy`, `Medium`, and `Hard`.
- Each live slot links to its Multiplayer Side Quest detail and shows status, provider, and player count.
- Empty slots keep an app-style placeholder so the screen structure remains stable when fewer than three official quests are available.

## Verification

- `pnpm build` passed on 2026-07-07.
- Local screenshot smoke passed against `http://localhost:4317/leaderboards`:
  - `artifacts/sqc-official-leaderboards-weekly-slot-parity-2026-07-07/desktop.png`
  - `artifacts/sqc-official-leaderboards-weekly-slot-parity-2026-07-07/mobile.png`
- Playwright observed HTTP 200, `Official Leaderboards.` as the H1, and `3` `.official-week-slot` elements on desktop and mobile.

## Notes

- The local server still printed the existing Clerk warning: `Refreshing the session token resulted in an infinite redirect loop`. It did not block the signed-out `/leaderboards` screenshots.
- No group quest persistence, proof, or account metadata logic changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
