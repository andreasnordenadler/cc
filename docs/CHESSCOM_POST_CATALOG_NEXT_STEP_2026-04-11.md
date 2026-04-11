# Chess.com post-catalog next step

Date: 2026-04-11
Owner: Sam

## Current shipped state

CC now has Chess.com verifier-backed support across the full live eleven-challenge catalog:

- finish-any-game
- finish-as-white
- finish-as-black
- win-as-white
- win-as-black
- draw-any-game
- draw-as-white
- draw-as-black
- lose-any-game
- lose-as-white
- lose-as-black

The current implementation already reuses one narrow proof loop:

- saved Chess.com username in account metadata
- pasted Chess.com game URL on the challenge page
- recent public archive lookup via the current single-game monthly archive scan
- persisted `passed` / `failed` / `pending` verdicts on submission

## Smallest next proof-bearing step

The next smallest reviewable step is not another challenge expansion, because the current live catalog is already fully covered.

The smallest safe follow-up is a live smoke-check artifact for one representative Chess.com-supported challenge route and submission flow wording, so we can prove the shipped catalog support is visible on the deployed product surface rather than only in local code and build output.

## Why this is the smallest step

- It reuses already-shipped challenge copy and verifier wiring.
- It does not add new challenge types, background jobs, or broader product scope.
- It produces external proof for the exact product claim now present across the catalog: “Lichess and Chess.com are supported here today.”
- It keeps the next executable slice reviewable as an audit/live-check item instead of another code change with little marginal product value.

## Exact next executable queue item

Record a concise live verification note for one representative Chess.com-supported challenge page, confirming:

1. the deployed route returns successfully,
2. the page exposes Chess.com submission wording, and
3. the current catalog claim is visible on the live surface.

Recommended route: `/challenges/lose-as-black`, because it is the last shipped Chess.com verifier slice and closes the catalog.

## Explicit deferrals

This artifact deliberately defers:

- adding new challenge types beyond the current eleven-item catalog,
- widening Chess.com lookup beyond the current recent archive loop,
- live signed-in submission execution that would require operator/browser interaction,
- UI rewrites, analytics, notifications, or background verification.
