# Chess.com next verifier-backed challenge slice 9

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `lose-as-white`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for:

1. `finish-any-game`,
2. `finish-as-white`,
3. `finish-as-black`,
4. `win-as-white`,
5. `win-as-black`,
6. `draw-any-game`,
7. `draw-as-white`,
8. `draw-as-black`, and
9. `lose-any-game`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection,
- side-aware verification for both White and Black, and
- decisive-result interpretation for wins, draws, and losses.

`lose-as-white` is the smallest reviewable next slice because it adds exactly one side constraint on top of the now-shipped `lose-any-game` outcome check. It reuses the existing White-side identity evidence and current loss-result interpretation without jumping ahead to the full loss-side pair.

## Existing Chess.com evidence to reuse

The existing public archive response already includes the needed fields:

- `game.white.username`
- `game.black.username`
- `game.white.result`
- `game.black.result`
- `game.end_time`
- `game.url`

The current verifier logic already uses these fields for URL matching, username matching, finished-game checks, side detection, and decisive-result interpretation. This slice only combines the already-shipped White-side check with the already-shipped loss check.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches the White player,
- the game is finished,
- and White lost the game.

Fail when the game is found and finished but either:

- the saved Chess.com username does not appear in the game,
- the saved Chess.com username appears as Black instead of White,
- White did not lose, or
- the game finished as a draw.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- Chess.com `lose-as-black` support,
- support for live-only or daily-only lookup paths outside the current archive loop,
- challenge-catalog changes beyond wiring the existing shipped `lose-as-white` challenge to the Chess.com verifier,
- UI restructuring, or
- broader progression/reward changes.

## Recommended next implementation slice

Wire Chess.com submissions for `lose-as-white` through one new narrow verifier that reuses the current archive lookup, identity matching, White-side detection, finished-game checks, and decisive-result interpretation, then persists real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
