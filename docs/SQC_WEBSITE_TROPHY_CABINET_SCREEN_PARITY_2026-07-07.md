# SQC website Trophy Cabinet screen parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `CoatBoardDashboard`.

## Change

- The standalone web Trophy Cabinet route now follows the mobile screen structure more closely: unified reward summary first, Official Multiplayer trophies, unlocked Solo rewards, Community Multiplayer trophies, and the Official Solo Side Quest collection preview.
- The route now counts Custom Solo rewards and finished top-three Multiplayer podium rewards from the same account and group quest sources used elsewhere on web.
- Official Multiplayer podiums are highlighted before community/custom rewards, matching the mobile app priority.
- The official Solo collection now uses the mobile labels `Unlocked` and `Locked preview` instead of the older generic trophy copy.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- `/trophy-cabinet` still reuses the existing `/badges` implementation, so `/badges`, `/coat-of-arms`, and `/trophy-cabinet` stay behaviorally aligned.
- No API, proof receipt, account metadata, or group quest persistence contracts changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
