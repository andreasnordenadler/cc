# Next Verifier-Backed Challenge Slice 4

Date: 2026-04-10
Owner: Sam

## Current verified catalog baseline

The live challenge catalog now has six narrow verifier-backed challenges with real Lichess verdict persistence:

1. `finish-any-game`
2. `finish-as-white`
3. `finish-as-black`
4. `win-as-white`
5. `win-as-black`
6. `draw-any-game`

Those now cover:
- finished-game verification
- side-aware finished-game verification
- side-aware win verification
- outcome-aware draw verification without side constraints

## Exact next challenge to add

Add exactly one new challenge: `draw-as-white`.

## Why this is the smallest reviewable post-catalog step

`draw-as-white` is the smallest next verifier-backed expansion because it:

- reuses the already-shipped draw outcome boundary from `draw-any-game`
- reuses the already-shipped side-awareness path from `finish-as-white` and `win-as-white`
- adds only one combined constraint, White plus draw, without introducing any new Lichess fields
- keeps the loop unchanged: submit one finished Lichess game ID and persist one `passed`, `failed`, or `pending` verdict

Compared with `draw-as-black`, multi-draw streaks, or rating-based milestones, `draw-as-white` is the narrowest next step because it extends the catalog by exactly one side-specific draw check and preserves the same single-game verifier shape already used elsewhere.

## Existing Lichess evidence it can reuse

The next slice can reuse the already-available Lichess evidence and verifier path:

- `status` to confirm the game is finished
- `players.white.user.name` and `players.black.user.name` to confirm the saved Lichess username appears in the game
- side resolution from the existing side-aware finish and win verifiers
- `winner` absence from `draw-any-game` to identify a draw
- the current submit-and-persist path in `src/app/actions.ts`
- the current export fetch path in `src/lib/lichess.ts`

No new external data source or broader verification system is needed.

## Explicit deferrals

This slice does not include:

- adding both draw side variants in one run
- changing the UI structure beyond one new challenge entry
- background rechecks, retries, or cron-based verification
- cumulative progression, streaks, or rating logic
- broader reward or challenge-order redesign

## Next code slice handoff

The next implementation item should:

1. add `draw-as-white` to `src/lib/challenges.ts`
2. add one narrow verifier wrapper for that challenge in `src/lib/lichess.ts`
3. persist real `passed`, `failed`, or `pending` verdicts for `draw-as-white` in `src/app/actions.ts`
4. verify with `pnpm lint` and `pnpm build`
