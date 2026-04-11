# Chess.com next verifier-backed challenge slice 3

Date: 2026-04-11
Owner: Sam

## Decision

The next exact Chess.com challenge to add should be `win-as-white`.

## Why this is the smallest reviewable next step

The live Chess.com verifier now proves the full finished-game loop for all three current `finish` checks:

1. `finish-any-game`,
2. `finish-as-white`, and
3. `finish-as-black`.

That means the current Chess.com path already covers:

- recent public archive lookup,
- saved-username identity matching,
- finished-game detection, and
- side-aware passing for both White and Black.

`win-as-white` is the smallest reviewable next slice because it keeps the same White-side requirement already shipped and adds only one new outcome check: whether White won the game. This is narrower than `win-as-black`, `draw`, or `lose` because it reuses the already-live White-side path instead of combining a new outcome check with Black-side verification or broader result families.

## Existing Chess.com evidence to reuse

The existing public archive response already includes the needed fields:

- `game.white.username`
- `game.black.username`
- `game.white.result`
- `game.black.result`
- `game.end_time`
- `game.url`

The current verifier logic already uses these responses for URL matching, identity matching, and finished-game checks. This slice only adds a narrow White-win interpretation on top of those same archive records.

## Exact pass/fail boundary

Pass when all of the following are true:

- the submitted value is a Chess.com game URL,
- the game is found in the recent public archives,
- the saved Chess.com username matches `game.white.username`,
- the game is finished,
- and the game result shows White won.

Fail when the game is found and finished but either:

- the saved Chess.com username appears as Black instead of White, or
- the saved Chess.com username appears as White and White did not win.

Pending when archive lookup is temporarily unavailable, the game is not visible yet, or the game is not finished.

## Explicit deferrals

This slice does not include:

- any Chess.com Black-win support,
- any draw or loss challenge wiring,
- support for live-only or daily-only lookup paths outside the current archive loop,
- UI restructuring,
- challenge-catalog expansion beyond wiring the existing shipped `win-as-white` challenge to the Chess.com verifier.

## Recommended next implementation slice

Wire Chess.com submissions for `win-as-white` through one new narrow verifier that reuses the current archive lookup, White-side matching, and finished-game checks, then persists real `passed`, `failed`, or `pending` verdicts in the existing attempt flow.
