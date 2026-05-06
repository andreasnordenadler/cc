# SQC remove loop language from user copy — 2026-05-06

## Scope
Andreas noted that the victory/proof copy mentioned `proof loop` / `loop`, which does not make sense for users.

## Changes made

- Removed visible `Proof Loop Test` / `loop` language from user-facing SQC copy in `src/`.
- Renamed the test quest title from `Proof Loop Test` to `Any Game Counts` while keeping the route/id unchanged.
- Changed visible badge/status text from internal loop language to player-facing completion language.
- Updated the victory scroll copy for the any-game quest so it says the game was completed and accepted for a coat of arms, not that a loop was stamped functional.
- Updated verifier summaries and pending copy to avoid internal loop wording.

## Verification

- Grep confirmed no remaining `Proof Loop`, `proof loop`, `Loop test`, `Loop Proven`, or visible `loop` strings in `src/app`, `src/components`, or `src/lib`.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
