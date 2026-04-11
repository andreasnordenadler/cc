# Chess.com live catalog parity next step

Date: 2026-04-11
Owner: Sam
Based on: `docs/CHESSCOM_LIVE_CATALOG_PARITY_AUDIT_2026-04-11.md`

## Exact next step

Deploy the already-shipped local eleven-challenge catalog to the active Vercel production target, then re-run the same three-route parity check against:

- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/lose-as-black`

## Why this is the smallest reviewable move

The parity audit already proved the gap is deployment parity, not a missing local implementation. `lose-as-black` exists locally and was previously wired in code, but the active live surface still serves the older ten-route catalog.

That makes the smallest reviewable next slice a deploy-plus-recheck proof step, not more product work, copy changes, or verifier expansion.

## What this step should prove

After deploy, the active live `/challenges` page should expose all eleven routes and `lose-as-black` should return `200` instead of `404`.

## Explicitly deferred

This step does not introduce new challenges, broaden the verification loop, or revisit auth/account cleanup. It only restores live parity between the already-shipped local catalog and the active deployment.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_LIVE_CATALOG_PARITY_NEXT_STEP_2026-04-11.md`.
