# Chess.com next verifier-backed challenge slice 8

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `lose-any-game`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for:

1. `finish-any-game`,
2. `finish-as-white`,
3. `finish-as-black`,
4. `win-as-white`,
5. `win-as-black`,
6. `draw-any-game`,
7. `draw-as-white`, and
8. `draw-as-black`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection,
- side-aware verification for both White and Black,
- decisive-result interpretation, and
- draw-specific verdicts for both side-agnostic and side-specific outcomes.

`lose-any-game` is the smallest reviewable next slice because it opens the final outcome family with no added side constraint. It reuses the already-shipped decisive-result evidence path, and it is narrower than jumping straight to `lose-as-white` or `lose-as-black`.

## Existing Chess.com evidence to reuse

The existing public archive response already includes the needed fields:

- `game.white.username`
- `game.black.username`
- `game.white.result`
- `game.black.result`
- `game.end_time`
- `game.url`

The current verifier logic already uses these fields for URL matching, identity matching, finished-game checks, side detection, and decisive-result interpretation for wins. This slice only reuses that same decisive-result evidence to confirm that the saved player lost instead of won.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches either player in the game,
- the game is finished,
- and the saved player lost the game.

Fail when the game is found and finished but either:

- the saved Chess.com username does not appear in the game, or
- the game finished as a win for the saved player, or
- the game finished as a draw.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- Chess.com `lose-as-white` support,
- Chess.com `lose-as-black` support,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring,
- challenge-catalog expansion beyond wiring the existing shipped `lose-any-game` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `lose-any-game` through one new narrow verifier that reuses the current archive lookup, identity matching, finished-game checks, and decisive-result interpretation, then persists real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
