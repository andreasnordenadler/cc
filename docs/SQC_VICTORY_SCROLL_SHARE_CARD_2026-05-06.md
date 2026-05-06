# SQC victory scroll share card — 2026-05-06

## Scope
Andreas corrected the direction for shareable completion artwork: the ornate SQC monogram was too complicated. The product needs a nice way of sharing good news in Side Quest Chess tone: a handwritten/parchment scroll with the unlocked coat of arms at the top, quest-relevant lightly mocking achievement text, and the canonical wax seal at the bottom.

## Changes made

- Reworked the passed-state share card on `/result` into a `victory-scroll` certificate-style artifact.
- The scroll shows:
  - unlocked coat of arms at the top
  - quest-specific achievement language in the middle
  - accepted proof/game line
  - date and points
  - canonical SQC wax seal at the bottom
- Added quest-result-aware copy helper so win/draw/loss/finish quests can speak in the SQC lightly mocking tone.
- Updated share action labels to `Copy scroll text` and `Share victory scroll`.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
