# SQC website Multiplayer language parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially the Multiplayer Side Quest labels, help copy, invite cleanup, and mode entry wording.

## Change

- Removed leftover signed-out web "shared table" and "join a table" phrasing from the Multiplayer Side Quests screen.
- Updated the Multiplayer mode switcher overview action from "Resume joined tables" to "Resume joined Multiplayer Side Quests".
- Normalized the web flow copy to use `Side Quest`, `Solo Side Quest`, `Multiplayer Side Quest`, and `challenge progress` language that better matches the mobile app product vocabulary.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- No route, API, auth, account, proof receipt, or group quest persistence behavior changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
