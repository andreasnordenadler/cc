# SQC website Official Leaderboards canonical route parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `AppTab` and `OfficialMultiplayerLeaderboardsScreen`.

## Change

- The web hamburger/top navigation now points `Official Leaderboards` to `/official-leaderboards`, matching the mobile app's `officialLeaderboards` companion screen name.
- The existing `/leaderboards` route remains available as a legacy alias to preserve links and proof/account behavior.
- The Settings parity hub now lists `Official Leaderboards` in the mobile app route group between Multiplayer Side Quests and Trophy Cabinet, while separating the old `/leaderboards` alias as a web companion shortcut.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- The build route table includes both `/official-leaderboards` and `/leaderboards`.

## Notes

- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
