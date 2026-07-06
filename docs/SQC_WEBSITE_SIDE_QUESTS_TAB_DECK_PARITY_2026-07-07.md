# SQC website Side Quests tab deck parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `SideQuestsScreen` and `SideQuestCatalogIntent`.

## Change

- The web `/solo` bottom-tab route now opens the app-style Side Quests screen instead of the older official-only catalog page.
- The app-style Side Quests screen keeps the mobile intent structure: Official Side Quests, Community Side Quests, My Custom Side Quests, and Create Custom Side Quest.
- The same screen now also renders the official Solo Side Quest deck below the current Side Quest card, matching the mobile screen expectation that the tab destination includes both catalog intent entry points and the playable deck.
- `/challenges` remains available as the direct official catalog route, preserving existing official detail links and proof/account behavior.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- Local production smoke:
  - `/solo`: rendered `Choose your next Side Quest.`, `Solo Side Quest deck`, and all four mobile Side Quest intents.
  - `/side-quests`: rendered `Choose your next Side Quest.`, `Solo Side Quest deck`, and all four mobile Side Quest intents.
- Screenshots:
  - `artifacts/sqc-website-side-quests-tab-parity-2026-07-07/solo-mobile-web.png`
  - `artifacts/sqc-website-side-quests-tab-parity-2026-07-07/side-quests-desktop.png`

## Notes

- Anonymous local screenshots completed, but the local server still logged Clerk's existing refresh-loop warning: `Refreshing the session token resulted in an infinite redirect loop`. The rendered pages and text assertions were still available for unauthenticated route proof.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
