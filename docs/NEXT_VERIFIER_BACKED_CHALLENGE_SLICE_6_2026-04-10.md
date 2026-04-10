# Next verifier-backed challenge slice 6 - 2026-04-10

## Current shipped state

The live catalog already supports eight fully automated verifier-backed challenges:

1. `finish-any-game`
2. `finish-as-white`
3. `finish-as-black`
4. `win-as-white`
5. `win-as-black`
6. `draw-any-game`
7. `draw-as-white`
8. `draw-as-black`

These all reuse the same single-game Lichess export fetch, identity matching, finished-game boundary, side detection, and outcome evaluation path already shipped in `src/lib/lichess.ts`, with verdict persistence already wired in `src/app/actions.ts`.

## Exact next challenge

Add `lose-any-game` next.

## Why this is the smallest safe slice

`lose-any-game` is the smallest reviewable next expansion because it adds exactly one new outcome boundary while keeping the same one-game submission loop and avoiding any new side-specific branching.

This is smaller than `lose-as-white`, `lose-as-black`, multi-game progression, rematch logic, rating gates, streaks, or any broader challenge-system redesign.

## Existing evidence it reuses

The next slice can reuse the Lichess evidence already available in the current verifier path:

- finished-game status from `status`
- player identity match from `players.white.user.name` / `players.black.user.name`
- side resolution from the matched white or black player slot
- winner detection from `winner`

No new external API fields are required. The only new rule is that the saved user appears in the finished game and the winning side, if present, is the opposite side.

## Explicit deferrals

This slice does not include:

- side-specific loss challenges
- resign-vs-timeout distinctions
- streaks, rating changes, or progression redesign
- background retries or async verification workers
- any challenge beyond `lose-any-game`

## Next code slice handoff

The next implementation item should:

1. add `lose-any-game` to `src/lib/challenges.ts`
2. add one narrow verifier wrapper in `src/lib/lichess.ts`
3. persist real `passed`, `failed`, or `pending` verdicts for `lose-any-game` in `src/app/actions.ts`
4. verify with `pnpm lint` and `pnpm build`
