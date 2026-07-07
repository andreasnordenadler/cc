# SQC website Multiplayer detail/create language parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `GlobalHamburgerMenu`, `MultiplayerSideQuestsDashboard`, `JoinedMultiplayerQuestModal`, and the Multiplayer create constants.

## Change

- Updated the web Multiplayer Side Quest draft builder to use app-facing create labels: `Name the Multiplayer Side Quest`, `Pick the Side Quest stack`, and `Multiplayer Side Quest` discovery/invite copy.
- Updated the sample Multiplayer detail route copy from older `table` and `runner` framing to the mobile app's `Multiplayer Side Quest`, `player`, `invite`, and `proof attempt` language.
- Tightened signed-out Account browse copy so it says visitors can browse live Side Quests and later join a Multiplayer Side Quest after sign-in.

## Verification

- `pnpm lint -- src/components/group-quest-draft-builder.tsx src/app/groupquests/gq_demo_no_castle_01/page.tsx src/app/account/page.tsx` passed.
- `pnpm build` passed. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- Screenshot proof from `pnpm exec next start -p 3062`:
  - `artifacts/sqc-multiplayer-language-parity-2026-07-07/demo-detail-desktop.png`
  - `artifacts/sqc-multiplayer-language-parity-2026-07-07/demo-detail-mobile.png`
  - `artifacts/sqc-multiplayer-language-parity-2026-07-07/account-signed-out-mobile.png`
- Screenshot server note: anonymous page loads rendered, but the server also emitted the existing Clerk warning: `Refreshing the session token resulted in an infinite redirect loop`.

## Notes

- Only visible copy changed. Existing route names, CSS class names, API fields, metadata helpers, and group quest storage contracts were left intact.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
