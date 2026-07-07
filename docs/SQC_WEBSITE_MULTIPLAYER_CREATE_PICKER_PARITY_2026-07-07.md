# SQC website Multiplayer create picker parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, `MultiplayerSideQuestsScreen`.

This slice tightens the website `Create Multiplayer Side Quest` flow around the mobile create modal.

## Mobile source behavior

- The create modal has an Included Side Quests section with `0/4` to `4/4` selected state.
- Players can browse or show only selected Side Quests.
- The catalog can be searched.
- Source tabs split `Official` and `Community` Side Quests.
- The max selection error says: `Choose up to 4 Side Quests. Remove one before adding another.`

## Web parity change

- `src/components/group-quest-draft-builder.tsx` now adds search, Browse / Selected controls, Official / Community source tabs, paged `Show more`, and an empty state to the quest picker.
- `src/app/globals.css` adds compact picker controls that match the existing app-like Side Quest tab treatment.

## Verification

- `pnpm build` passed on 2026-07-07.
