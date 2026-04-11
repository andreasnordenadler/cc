# Chess.com post-parity boundary-detail next step

Date: 2026-04-11
Owner: Sam
Based on: `docs/CHESSCOM_LIVE_CATALOG_PARITY_RECHECK_2026-04-11.md`, `docs/CHESSCOM_POST_PARITY_NEXT_STEP_2026-04-11.md`, `docs/CHESSCOM_POST_PARITY_SMOKE_2026-04-11.md`

## Exact next step

Record one fresh active-live smoke proof for the boundary Chess.com-supported challenge detail page `lose-as-black` on the same active production target.

## Why this is the smallest reviewable move

The current proof chain already covers the restored eleven-route catalog and one representative non-boundary detail route. The tightest next confidence extension is not another deploy or verifier change, but one boundary detail recheck for the route that was previously missing from the live catalog.

`lose-as-black` is now the smallest useful follow-up because it was the parity-boundary route in the earlier live mismatch, so confirming its detail page still resolves cleanly gives stronger confidence without widening scope.

## What this step should prove

A live request to `/challenges/lose-as-black` on the active production target should return `200` and still show the shipped Chess.com submission wording on the rendered challenge page.

## Explicitly deferred

This step does not add challenges, change verification logic, alter auth or account flows, or trigger another deploy. It only defines the next smallest proof-bearing live smoke check after the representative post-parity detail proof.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_BOUNDARY_NEXT_STEP_2026-04-11.md`.
