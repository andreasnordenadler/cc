# Chess.com next verifier-backed challenge slice 4

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `win-as-black`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for:

1. `finish-any-game`,
2. `finish-as-white`,
3. `finish-as-black`, and
4. `win-as-white`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection,
- side-aware verification for both White and Black, and
- a shipped win-specific verdict for one side.

`win-as-black` is the smallest reviewable next slice because it keeps the same `win` outcome logic that is already live for `win-as-white` and adds only the missing Black-side pairing. This is narrower than moving into `draw` or `lose`, because those would introduce a new result family instead of just reusing the existing win boundary on the opposite side.

## Existing Chess.com evidence to reuse

The existing public archive response already includes the needed fields:

- `game.white.username`
- `game.black.username`
- `game.white.result`
- `game.black.result`
- `game.end_time`
- `game.url`

The current verifier logic already uses these fields for URL matching, identity matching, finished-game checks, side detection, and White-win interpretation. This slice only adds the Black-win interpretation on top of the same archive records.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches `game.black.username`,
- the game is finished,
- and the game result shows Black won.

Fail when the game is found and finished but either:

- the saved Chess.com username appears as White instead of Black, or
- the saved Chess.com username appears as Black and Black did not win.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- any Chess.com draw support,
- any Chess.com loss support,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring,
- challenge-catalog expansion beyond wiring the existing shipped `win-as-black` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `win-as-black` through one new narrow verifier that reuses the current archive lookup, Black-side matching, and finished-game checks, then persists real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
