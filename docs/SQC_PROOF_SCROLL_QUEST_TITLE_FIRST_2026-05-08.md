# SQC proof scroll quest-title-first hierarchy — 2026-05-08

## Trigger
Andreas suggested the proof/victory scroll should put the quest name on top instead of leading with the coat-of-arms name.

## Change
Updated the proof hierarchy so the user sees the completed quest first:

- victory scroll kicker now says `Quest completed`
- main scroll headline now uses the quest title, e.g. `Any Game Counts`
- coat-of-arms name appears beneath as the unlocked reward
- generated share/proof images use the same hierarchy
- public proof page metadata/hero also leads with the quest completion title

## Verification
- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
