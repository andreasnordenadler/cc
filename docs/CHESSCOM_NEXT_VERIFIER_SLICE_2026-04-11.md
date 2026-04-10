# Chess.com next verifier-backed challenge slice

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `finish-as-white`.

## Why this is the smallest reviewable next step

The live Chess.com verifier already proves three things for `finish-any-game`:

1. the submitted URL resolves to a recent public archive game,
2. the saved Chess.com username appears in that game,
3. the game is finished.

`finish-as-white` is the narrowest next expansion because it reuses that same archive lookup and identity match, and only adds one side check: the saved username must match `game.white.username`.

This is smaller than any win, draw, or loss slice because those would add outcome interpretation on top of the current Chess.com path. It is also a better first side-aware slice than `finish-as-black` because it follows the existing catalog progression already used on the Lichess path.

## Existing Chess.com evidence to reuse

The current Chess.com public archive response already gives the needed fields:

- `game.white.username`
- `game.black.username`
- `game.end_time`
- `game.url`

No broader ingestion, polling, or background sync is needed for this slice.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches `game.white.username`,
- the game is finished.

Fail when the game is found but the saved Chess.com username does not appear as White.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- `finish-as-black`,
- any Chess.com win/draw/loss interpretation,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring or challenge-catalog expansion beyond wiring the existing shipped `finish-as-white` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `finish-as-white` through one new narrow verifier that reuses the current archive lookup and side-matching logic, then persist real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
