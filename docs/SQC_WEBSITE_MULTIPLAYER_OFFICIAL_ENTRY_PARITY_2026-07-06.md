# SQC website Multiplayer official entry parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`, especially the `multiplayerCatalogTab` default of `official` and the Official/Community tab labels in `MultiplayerSideQuestsScreen`.

## Change

- `/multiplayer` now marks `Official Multiplayer` as the active Multiplayer mode instead of treating the whole screen as `My active`.
- The mode switcher keeps the mobile structure: `Official Side Quests`, `Community Side Quests`, `My active / join`, and `Create Multiplayer Side Quest`.
- `My active / join` now anchors to `#my-multiplayer-side-quests` so resume/join actions are reachable without changing the top-level screen identity.
- The route guide copy now mirrors mobile intent: Official first, Community one switch away, with create and private-code join as actions.

## Verification

- `pnpm build` passed on 2026-07-06. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- No API, proof, account, or group quest persistence logic changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
