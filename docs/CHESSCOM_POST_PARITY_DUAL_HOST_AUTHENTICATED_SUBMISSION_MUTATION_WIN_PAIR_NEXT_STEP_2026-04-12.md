# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Win-Pair Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/win-as-white` and `/challenges/win-as-black` surfaces on the canonical host and active deployment host.

The mutation should stay narrow: reuse the same single `gameId` field mutation shape already proven on `/challenges/finish-any-game`, submit one Chess.com-shaped value on both hosts for each side-aware win route during one proof window, and capture the resulting post-submit state without widening into loss, draw, or account-setting mutations.

## Why this is the tightest remaining confidence extension

The current proof chain already covers both hosts in a signed-in browser context for the full eleven-route read-only catalog, one authenticated generic finish submission mutation, and one authenticated side-aware finish-pair submission mutation. That closes the smallest generic write-path gap and the nearest same-family branch extension.

The next tightest extension is still not a broad mutation sweep. It is one side-aware win-pair mutation proof using the already shipped win-family surfaces that were previously matched read-only across both hosts. `/challenges/win-as-white` and `/challenges/win-as-black` are the narrowest follow-up because they extend confidence from the finish-family mutation proof into one adjacent paired family while staying reviewable, preserving the same signed-in browser flow, and avoiding wider loss-family and draw-family mutation expansion.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/win-as-white`
- `/challenges/win-as-black`
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window
- the same narrow Chess.com-shaped `gameId` mutation style already proven on `/challenges/finish-any-game`

It should preserve the same evidence style: exact URLs, concise visible before and after state, and one final dual-host authenticated submission-mutation parity verdict.

## Explicit deferrals

This next step does not include:

- loss-family submission mutations
- draw-family submission mutations
- mutation sweeps across the full challenge catalog
- account-setting mutations
- deployment work
- verifier rewrites

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, accept the same narrow submission mutation on `/challenges/win-as-white` and `/challenges/win-as-black`, render the same resulting post-submit state on each side-aware win surface, and preserve matching signed-in account and challenge-list context around those mutations.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_WIN_PAIR_NEXT_STEP_2026-04-12.md`.
