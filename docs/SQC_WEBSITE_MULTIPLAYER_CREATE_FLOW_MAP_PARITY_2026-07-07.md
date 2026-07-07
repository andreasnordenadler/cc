# SQC website Multiplayer create flow map parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `MultiplayerSideQuestsScreen`, `MULTIPLAYER_CREATE_MAX_QUESTS`, `MULTIPLAYER_PROVIDER_MODES`, and the create state fields.

## Change

- `/groupquests/create` now introduces the mobile create flow before the existing builder instead of dropping users straight into a bare form.
- The web create screen now shows the mobile max-four Side Quest rule, Official vs Community picker sources, default invite-copy intent, provider/rule fields, proof window, and invite visibility sequence.
- The page reflects preselected catalog launches with `?quest=<id>` by naming the selected quest in the flow map when available.
- `/create-multiplayer-side-quest` remains a route alias to `/groupquests/create`.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- Screenshot not captured in this slice because `/groupquests/create` is an authenticated route and the current local auth path has the previously documented Clerk refresh-loop blocker for clean signed-in browser proof. Build and route/static checks were used instead.

## Notes

- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
