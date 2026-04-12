# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Loss-Pair Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/lose-as-black` and `/challenges/lose-as-white` surfaces on the canonical host and active deployment host.

The mutation should stay narrow: reuse the same single `gameId` field mutation shape already proven on `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/win-as-white`, and `/challenges/win-as-black`, submit one Chess.com-shaped value on both hosts for each side-aware loss route during one proof window, and capture the resulting post-submit state without widening into draw-family or account-setting mutations.

## Why this is the tightest remaining confidence extension

The current proof chain already covers both hosts in a signed-in browser context for the full eleven-route read-only catalog, one authenticated generic finish submission mutation, one authenticated side-aware finish-pair submission mutation, and one authenticated side-aware win-pair submission mutation. That closes the smallest generic write-path gap plus two adjacent paired-family extensions.

The next tightest extension is still not a broad mutation sweep. It is one side-aware loss-pair mutation proof using the already shipped loss-family surfaces that were previously matched read-only across both hosts. `/challenges/lose-as-black` and `/challenges/lose-as-white` are the narrowest follow-up because they extend confidence into the remaining side-aware loss family while preserving the same signed-in browser flow, evidence shape, and narrow `gameId` mutation style.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/lose-as-black`
- `/challenges/lose-as-white`
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window
- the same narrow Chess.com-shaped `gameId` mutation style already proven on the finish-pair and win-pair routes

It should preserve the same evidence style: exact URLs, concise visible before and after state, and one final dual-host authenticated submission-mutation parity verdict.

## Explicit deferrals

This next step does not include:

- draw-family submission mutations
- mutation sweeps across the full challenge catalog
- account-setting mutations
- deployment work
- verifier rewrites

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, accept the same narrow submission mutation on `/challenges/lose-as-black` and `/challenges/lose-as-white`, render the same resulting post-submit state on each side-aware loss surface, and preserve matching signed-in account and challenge-list context around those mutations.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_LOSS_PAIR_NEXT_STEP_2026-04-12.md`.
