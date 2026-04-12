# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Generic-Draw Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check on the signed-in `/challenges/draw-any-game` surface on the canonical host and active deployment host.

The mutation should stay narrow: reuse the same single `gameId` field mutation shape already proven on `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/win-as-white`, `/challenges/win-as-black`, `/challenges/lose-as-black`, `/challenges/lose-as-white`, `/challenges/draw-as-black`, and `/challenges/draw-as-white`, submit one Chess.com-shaped value on both hosts for the generic draw route during one proof window, and capture the resulting post-submit state without widening into account-setting mutations or full-catalog mutation sweeps.

## Why this is the tightest remaining confidence extension

The current proof chain already covers both hosts in one signed-in browser context for the full eleven-route read-only catalog, one authenticated generic finish submission mutation, authenticated side-aware finish-pair submission mutation, authenticated side-aware win-pair submission mutation, authenticated side-aware loss-pair submission mutation, and authenticated side-aware draw-pair submission mutation. That closes the generic finish path plus all paired side-aware mutation families.

The next tightest extension is still not a broad mutation sweep. It is one generic draw mutation proof on `/challenges/draw-any-game`, using the already shipped generic draw surface that has already matched read-only across both hosts. This keeps the scope to one remaining generic route in the draw family while preserving the same signed-in browser flow, evidence shape, and narrow `gameId` mutation style.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/draw-any-game`
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window
- the same narrow Chess.com-shaped `gameId` mutation style already proven on the finish, win, loss, and side-aware draw mutation routes

It should preserve the same evidence style: exact URLs, concise visible before and after state, and one final dual-host authenticated submission-mutation parity verdict.

## Explicit deferrals

This next step does not include:

- generic loss mutation work
- mutation sweeps across the full challenge catalog
- account-setting mutations
- deployment work
- verifier rewrites

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, accept the same narrow submission mutation on `/challenges/draw-any-game`, render the same resulting post-submit state on that generic draw surface, and preserve matching signed-in account and challenge-list context around that mutation.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_GENERIC_DRAW_NEXT_STEP_2026-04-12.md`.
