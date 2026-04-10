# Next verifier-backed challenge slice 7 - 2026-04-10

## Current shipped state

The live catalog already supports nine fully automated verifier-backed challenges:

1. `finish-any-game`
2. `finish-as-white`
3. `finish-as-black`
4. `win-as-white`
5. `win-as-black`
6. `draw-any-game`
7. `draw-as-white`
8. `draw-as-black`
9. `lose-any-game`

These all reuse the same single-game Lichess export fetch, identity matching, finished-game boundary, side detection, and winner-aware outcome evaluation path already shipped in `src/lib/lichess.ts`, with verdict persistence already wired in `src/app/actions.ts`.

## Exact next challenge

Add `lose-as-white` next.

## Why this is the smallest safe slice

`lose-as-white` is the smallest reviewable next expansion because it adds exactly one side-specific refinement on top of the already-shipped `lose-any-game` outcome check.

This is smaller than `lose-as-black`, multi-game progression, opening-specific losses, resignation-only rules, rating gates, streaks, or any broader challenge-system redesign.

## Existing evidence it reuses

The next slice can reuse the Lichess evidence already available in the current verifier path:

- finished-game status from `status`
- player identity match from `players.white.user.name` / `players.black.user.name`
- side resolution from the matched white or black player slot
- winner detection from `winner`

No new external API fields are required. The only added rule is that the saved user must appear in the finished game as White and the winning side must be Black.

## Explicit deferrals

This slice does not include:

- `lose-as-black`
- resign-vs-timeout distinctions
- streaks, rating changes, or progression redesign
- background retries or async verification workers
- any challenge beyond `lose-as-white`

## Next code slice handoff

The next implementation item should:

1. add `lose-as-white` to `src/lib/challenges.ts`
2. add one narrow verifier wrapper in `src/lib/lichess.ts`
3. persist real `passed`, `failed`, or `pending` verdicts for `lose-as-white` in `src/app/actions.ts`
4. verify with `pnpm lint` and `pnpm build`
