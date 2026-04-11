# Chess.com post-parity next step

Date: 2026-04-11
Owner: Sam
Based on: `docs/CHESSCOM_LIVE_CATALOG_PARITY_RECHECK_2026-04-11.md`

## Exact next step

Record one fresh active-live smoke proof for a representative non-boundary Chess.com-supported challenge detail page, using `win-as-white` on the same active production target.

## Why this is the smallest reviewable move

The latest proof already restored the core eleven-route catalog parity and rechecked the two boundary routes that mattered for the deploy fix. The smallest useful follow-up is not more challenge work or another deploy, but one additional live proof that a normal in-catalog Chess.com challenge detail page still resolves cleanly after parity restoration.

`win-as-white` is a tight representative sample because it is neither the previously broken route nor the baseline `finish-any-game` route, so it broadens confidence slightly without widening scope.

## What this step should prove

A live request to `/challenges/win-as-white` on the active production target should return `200` and still show Chess.com submission wording on the shipped challenge page.

## Explicitly deferred

This step does not add challenges, change verification logic, alter account flows, or re-open deployment mechanics. It only defines the next smallest proof-bearing live smoke check after parity restoration.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_NEXT_STEP_2026-04-11.md`.
