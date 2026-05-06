# SQC Proof Loop Test quest — 2026-05-06

## User request

Andreas asked for a complete pickable quest used for testing the full completion loop: play any game anywhere, win or lose, any type of game, then use it to test quest activation, verification, completion, coat-of-arms unlock, proof log, and sharing.

## Change

Added a new real quest: **Proof Loop Test** (`finish-any-game`).

It is intentionally an exception to the normal SQC canon that quests require a win, because its product purpose is onboarding/testing the loop rather than competitive challenge difficulty.

## Quest behavior

- Pickable from the normal quest surfaces.
- Has full challenge metadata, rules, reward, proof copy, and generated coat-of-arms token metadata.
- Rule: any public finished Lichess or Chess.com game counts.
- Win/loss/draw/color/time-control are accepted.
- Latest-game verifier is live for saved Lichess usernames.
- Latest-game verifier is live for saved Chess.com usernames via recent public archives.
- Manual game submission also works through the existing `finish-any-game` verifier branch.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
