# Next Verifier-Backed Challenge Slice 8

Date: 2026-04-10
Project: CC

## Exact next challenge

Add `lose-as-black` next.

## Why this is the smallest reviewable post-catalog step

The live catalog already ships ten verifier-backed or verifier-ready challenge shapes:
- finish any game
- finish as white
- finish as black
- win as white
- win as black
- draw any game
- draw as white
- draw as black
- lose any game
- lose as white

`lose-as-black` is the narrowest next step because it simply closes the missing side-pair for the already-shipped loss flow. It does not require any new product surface, background work, challenge-loop redesign, or broader progression system.

## Existing Lichess evidence it reuses

This slice can reuse the same single-game evidence already used by the live loss verifier:
- finished-game status from the Lichess export
- saved Lichess username presence in the game
- side detection from `players.white.user.name` and `players.black.user.name`
- `winner` to confirm the opposite side won

## Explicit deferrals

This slice does not introduce:
- multi-game streaks or cumulative goals
- rating, time-control, or opening-specific checks
- UI expansion beyond the current challenge detail submission loop
- retries, queues, or asynchronous background verification
- broader progression or reward redesign

## Result

The smallest safe post-catalog move is to implement `lose-as-black` only, using the existing loss verification path with a black-side wrapper.
