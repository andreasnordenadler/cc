# SQC activation auto latest-game check — 2026-05-05

## Change

When a signed-in user activates a quest and has a saved Lichess or Chess.com identity, `startChallenge` now immediately runs the same latest-game verifier flow that previously required the first manual Refresh.

## Behavior

- Activation still sets the selected quest as the one active quest.
- If a chess identity exists, activation records latest-game receipts immediately.
- Passed activation checks update active quest status to `verified` and update challenge progress/points.
- Failed/pending activation checks are recorded as proof receipts.
- If the provider check fails, activation remains non-blocking and records a pending explanatory receipt.
- If no chess identity exists, activation does not create a fake fixture receipt.

## UI copy

The individual quest page run-flow now says activation runs an immediate latest-game check and that Refresh is for the next receipt after another game.

## Verification

- `pnpm lint`
- `pnpm build`
