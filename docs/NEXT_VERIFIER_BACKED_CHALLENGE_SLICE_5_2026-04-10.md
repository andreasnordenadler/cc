# Next verifier-backed challenge slice 5 - 2026-04-10

## Current shipped state

The live catalog already supports seven fully automated verifier-backed challenges:

1. `finish-any-game`
2. `finish-as-white`
3. `finish-as-black`
4. `win-as-white`
5. `win-as-black`
6. `draw-any-game`
7. `draw-as-white`

These reuse the same single-game Lichess export fetch, identity matching, finished-game check, side detection, and outcome evaluation path in `src/lib/lichess.ts`, with persistence already wired in `src/app/actions.ts`.

## Exact next challenge

Add `draw-as-black` next.

## Why this is the smallest safe slice

`draw-as-black` is the narrow side-pair completion for the already-shipped `draw-as-white` challenge. It stays inside the existing draw-verification path and only adds one more side-specific branch.

This is smaller and safer than introducing any new result type, streak logic, rating thresholds, multi-game requirements, or broader progression mechanics.

## Existing evidence it reuses

The slice can reuse all currently available Lichess evidence already consumed by the draw verifier:

- finished-game status from `status`
- no winning side from `winner`
- player identity match from `players.white.user.name` / `players.black.user.name`
- side awareness from the matched white/black player slot

No new external API fields are required.

## Explicit deferrals

This slice does not include:

- any new UI pattern
- any challenge progression redesign
- multi-attempt aggregation
- new leaderboard or reward behavior
- any challenge beyond `draw-as-black`

## Verification

Planned completion proof for this planning slice: committed artifact exists at `docs/NEXT_VERIFIER_BACKED_CHALLENGE_SLICE_5_2026-04-10.md`.
