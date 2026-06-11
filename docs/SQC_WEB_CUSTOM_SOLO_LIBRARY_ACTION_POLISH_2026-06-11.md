# SQC Web Custom Solo Library Action Polish — 2026-06-11

## Sprint slice

Continued the SQC website UX parity review on the Custom Solo surface Andreas flagged. This slice focuses on the saved Custom Solo library cards, where proof, public-page, Multiplayer, edit, archive, duplicate, reset, deactivate, and delete controls were previously presented as one long button cluster.

## User-facing changes

- Replaced the flat Custom Solo card action pile with an SQC-styled action panel.
- Added a clear card status line (`Running now`, `Proof saved`, `Ready to run`, archive/private shelf states) beside the lifecycle badge.
- Grouped public/open/start/Multiplayer actions under `Play`.
- Grouped active/completed proof actions under `Proof tools` only when relevant.
- Moved duplicate/edit/archive/delete controls into a collapsed `Manage recipe` disclosure so destructive and maintenance actions no longer compete with the main play path.
- Renamed the card edit action to `Edit recipe`, keeping internal/website wording out of visible product copy.

## Safety / scope notes

- No verifier behavior, quest release state, public discovery rules, or data lifecycle semantics changed.
- Delete remains behind the existing explicit disclosure/confirm step.
- Private custom configs and account metadata remain hidden.

## Checks

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` — passed with the existing ignored CSS-file warning only.
- `pnpm build` — passed.

## Production proof

Pending deploy/smoke in this slice.
