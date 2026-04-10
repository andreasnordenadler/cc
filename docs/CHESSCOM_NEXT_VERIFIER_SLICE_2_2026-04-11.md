# Chess.com next verifier-backed challenge slice 2

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `finish-as-black`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for both:

1. `finish-any-game`, and
2. `finish-as-white`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection,
- side-aware passing for White.

`finish-as-black` is the smallest next reviewable slice because it reuses the exact same loop and only flips the side requirement from `white` to `black`. No new outcome logic, new endpoints, or broader catalog work is needed.

This is smaller than any `win`, `draw`, or `lose` Chess.com slice because those would require interpreting result fields in addition to the current side-aware finished-game verification.

## Existing Chess.com evidence to reuse

The existing public archive response already includes everything needed:

- `game.white.username`
- `game.black.username`
- `game.end_time`
- `game.url`

The current verifier logic already uses these fields for URL matching, identity matching, and finished-game checks. This slice only needs the existing side comparison against `game.black.username`.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches `game.black.username`,
- the game is finished.

Fail when the game is found but the saved Chess.com username does not appear as Black.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- any Chess.com win/draw/loss interpretation,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring,
- challenge-catalog expansion beyond wiring the existing shipped `finish-as-black` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `finish-as-black` through one new narrow verifier that reuses the current archive lookup and side-matching logic, then persist real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
