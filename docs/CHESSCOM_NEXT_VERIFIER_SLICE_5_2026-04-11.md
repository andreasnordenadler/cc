# Chess.com next verifier-backed challenge slice 5

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `draw-any-game`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for:

1. `finish-any-game`,
2. `finish-as-white`,
3. `finish-as-black`,
4. `win-as-white`, and
5. `win-as-black`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection,
- side-aware verification for both White and Black, and
- win-specific verdicts for both sides.

`draw-any-game` is the smallest reviewable next slice because it introduces exactly one new result family while avoiding any new side-specific branching. This is narrower than `draw-as-white` or `draw-as-black`, and it is a smaller progression step than moving into the `lose` family.

## Existing Chess.com evidence to reuse

The existing public archive response already includes the needed fields:

- `game.white.username`
- `game.black.username`
- `game.white.result`
- `game.black.result`
- `game.end_time`
- `game.url`

The current verifier logic already uses these fields for URL matching, identity matching, finished-game checks, and side detection. This slice only adds draw interpretation on top of the same archive records.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches either player in the game,
- the game is finished,
- and the result shows the game ended in a draw.

Fail when the game is found and finished but either:

- the saved Chess.com username does not match either player, or
- the game finished with a decisive result instead of a draw.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- Chess.com side-specific draw support,
- any Chess.com loss support,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring,
- challenge-catalog expansion beyond wiring the existing shipped `draw-any-game` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `draw-any-game` through one new narrow verifier that reuses the current archive lookup, identity matching, and finished-game checks, then persists real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
