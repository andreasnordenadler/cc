# SQC website primary tab order parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `TABS` and `GlobalHamburgerMenu`.

## Change

- The web desktop primary nav now matches the mobile five-tab app model:
  - Home
  - Solo Side Quests
  - Multiplayer Side Quests
  - Trophy Cabinet
  - My Account / Sign in / Account
- `Official Leaderboards` remains in the hamburger menu and route aliases as a companion screen, matching the mobile app where it is an `AppTab` destination but not one of the five bottom tabs.
- The bottom dock was already aligned and remains unchanged.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- No route aliases, Clerk/account behavior, proof logic, or group quest APIs changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
