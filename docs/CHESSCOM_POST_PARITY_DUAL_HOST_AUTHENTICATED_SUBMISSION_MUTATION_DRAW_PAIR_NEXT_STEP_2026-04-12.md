# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Draw-Pair Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/draw-as-black` and `/challenges/draw-as-white` surfaces on the canonical host and active deployment host.

The mutation should stay narrow: reuse the same single `gameId` field mutation shape already proven on `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/win-as-white`, `/challenges/win-as-black`, `/challenges/lose-as-black`, and `/challenges/lose-as-white`, submit one Chess.com-shaped value on both hosts for each side-aware draw route during one proof window, and capture the resulting post-submit state without widening into account-setting mutations or broader catalog sweeps.

## Why this is the tightest remaining confidence extension

The current proof chain already covers both hosts in a signed-in browser context for the full eleven-route read-only catalog, one authenticated generic finish submission mutation, authenticated side-aware finish-pair submission mutation, authenticated side-aware win-pair submission mutation, and authenticated side-aware loss-pair submission mutation. That closes the generic write path plus the finish, win, and loss side-aware families.

The next tightest extension is still not a broad mutation sweep. It is one side-aware draw-pair mutation proof using the already shipped draw-family surfaces that were previously matched read-only across both hosts. `/challenges/draw-as-black` and `/challenges/draw-as-white` are now the smallest remaining paired mutation family that extends confidence while preserving the same signed-in browser flow, evidence shape, and narrow `gameId` mutation style.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/draw-as-black`
- `/challenges/draw-as-white`
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window
- the same narrow Chess.com-shaped `gameId` mutation style already proven on the finish, win, and loss mutation routes

It should preserve the same evidence style: exact URLs, concise visible before and after state, and one final dual-host authenticated submission-mutation parity verdict.

## Explicit deferrals

This next step does not include:

- generic draw mutation work beyond the paired side-aware routes
- mutation sweeps across the full challenge catalog
- account-setting mutations
- deployment work
- verifier rewrites

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, accept the same narrow submission mutation on `/challenges/draw-as-black` and `/challenges/draw-as-white`, render the same resulting post-submit state on each side-aware draw surface, and preserve matching signed-in account and challenge-list context around those mutations.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_DRAW_PAIR_NEXT_STEP_2026-04-12.md`.
