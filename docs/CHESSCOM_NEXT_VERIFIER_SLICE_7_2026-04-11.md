# Chess.com next verifier-backed challenge slice 7

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `draw-as-black`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for:

1. `finish-any-game`,
2. `finish-as-white`,
3. `finish-as-black`,
4. `win-as-white`,
5. `win-as-black`,
6. `draw-any-game`, and
7. `draw-as-white`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection,
- side-aware verification for both White and Black, and
- draw-specific verdicts for both side-agnostic and White-side outcomes.

`draw-as-black` is the smallest reviewable next slice because it closes the draw side-pair with the same already-shipped result family and side-detection loop. This is narrower than opening the `lose` family, and smaller than bundling multiple Chess.com challenges into one change.

## Existing Chess.com evidence to reuse

The existing public archive response already includes the needed fields:

- `game.white.username`
- `game.black.username`
- `game.white.result`
- `game.black.result`
- `game.end_time`
- `game.url`

The current verifier logic already uses these fields for URL matching, identity matching, finished-game checks, draw detection, and side detection. This slice only combines the already-live draw interpretation with the already-live Black-side check.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches the Black player in the game,
- the game is finished,
- and the result shows the game ended in a draw.

Fail when the game is found and finished but either:

- the saved Chess.com username is not the Black player in the game, or
- the game finished with a decisive result instead of a draw.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- any Chess.com loss support,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring,
- challenge-catalog expansion beyond wiring the existing shipped `draw-as-black` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `draw-as-black` through one new narrow verifier that reuses the current archive lookup, identity matching, finished-game checks, draw detection, and Black-side detection, then persists real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
