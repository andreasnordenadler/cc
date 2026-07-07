# SQC website Multiplayer Learn collapse parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `MultiplayerSideQuestsScreen`.

## Change

- The web Multiplayer Side Quests entry now keeps catalog/action lanes first instead of leading with the old explanatory content.
- The educational Multiplayer overview is now a collapsed `Learn` panel, matching the mobile screen's `What Multiplayer Side Quests are` toggle.
- The Learn panel reuses the mobile labels and order: `Learn`, `What Multiplayer Side Quests are`, `Create. Invite. Play. Prove.`, and the separate multiplayer proof-ledger explanation.
- Signed-in and signed-out web visitors both get the same collapsed Learn behavior while existing public browse, private invite, create, join, and proof/account links remain unchanged.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- Local production smoke with `pnpm exec next start -p 3100` passed for `/multiplayer`: static label assertions found `Official Side Quests`, `Community Side Quests`, `What Multiplayer Side Quests are`, and `Open the educational overview.`
- Screenshot captured: `artifacts/sqc-website-multiplayer-learn-collapse-2026-07-07/multiplayer-mobile.png`.
- The local server still logged Clerk's existing refresh-loop warning: `Refreshing the session token resulted in an infinite redirect loop`. The signed-out `/multiplayer` route still rendered for smoke proof.
- No API, proof receipt, group quest persistence, Clerk, or account metadata contracts changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
