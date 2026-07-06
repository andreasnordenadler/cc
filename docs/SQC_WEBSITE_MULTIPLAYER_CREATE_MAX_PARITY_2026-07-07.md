# SQC website Multiplayer create max parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `MULTIPLAYER_DEFAULT_INVITE_COPY`, `MULTIPLAYER_CREATE_MAX_QUESTS`, and the create modal copy in `MultiplayerSideQuestsScreen`.

## Change

- The web Multiplayer Side Quest builder now uses the same default invite copy as mobile: "A Multiplayer Side Quest where everyone tries the same Side Quests with fresh public games."
- The normal create flow now starts with a small default Side Quest stack from the catalog, matching the mobile create draft behavior more closely than the old single-quest default.
- The web quest picker now enforces the mobile four-Side-Quest maximum, shows `x/4 selected`, disables extra unchecked rows at the cap, and uses the mobile max-copy: "Choose up to 4 Side Quests. Remove one before adding another."
- The final create action now says "Create Multiplayer Side Quest" / "Creating..." instead of the older save-table language.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- No API, proof receipt, account, or group quest persistence contracts changed.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
