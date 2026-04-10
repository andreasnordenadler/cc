# Next Verifier-Backed Challenge Slice 3

Date: 2026-04-10
Owner: Sam

## Current verified catalog baseline

The live challenge catalog now has five narrow verifier-backed challenges with real Lichess verdict persistence:

1. `finish-any-game`
2. `finish-as-white`
3. `finish-as-black`
4. `win-as-white`
5. `win-as-black`

Those cover two tight verification dimensions already present in the shipped loop:
- player side (`white` / `black` / `either`)
- game outcome family (`finish` and `win`)

## Exact next challenge to add

Add exactly one new challenge: `draw-any-game`.

## Why this is the smallest reviewable post-catalog step

`draw-any-game` is the smallest next verifier-backed expansion because it:

- adds only one new outcome branch, without introducing any new side logic
- reuses the existing finished-game requirement and existing player-membership checks
- keeps the challenge loop unchanged: user submits a finished Lichess game ID and receives a stored `passed`, `failed`, or `pending` verdict
- avoids a broader progression rewrite, streak system, background polling, or multi-game aggregation

Compared with alternatives like `draw-as-white`, `draw-as-black`, or rating-based milestones, `draw-any-game` is narrower because it introduces only one new outcome condition at a time.

## Existing Lichess evidence it can reuse

The next slice can reuse the already-shipped Lichess evidence and flow:

- `status` to confirm the game is finished
- `players.white.user.name` and `players.black.user.name` to confirm the saved Lichess username appears in the game
- `winner` to distinguish non-win finished games from wins
- the current submit-and-persist verification path in `src/app/actions.ts`
- the current fetch/export path in `src/lib/lichess.ts`

The only additional interpretation needed is a strict draw verdict boundary for finished games where the saved user appears and no winning side is present.

## Explicit deferrals

This slice does not include:

- adding both draw side variants in one run
- changing UI structure beyond the new single challenge entry
- retries, background rechecks, or cron-driven verification
- rating, opening, move-count, or accuracy-based challenge logic
- any broader progression or reward-system redesign

## Next code slice handoff

The next implementation item should:

1. add `draw-any-game` to `src/lib/challenges.ts`
2. add one narrow Lichess verifier wrapper for that challenge
3. persist real `passed`, `failed`, or `pending` verdicts for `draw-any-game` in `src/app/actions.ts`
4. verify with `pnpm lint` and `pnpm build`
