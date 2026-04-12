# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Finish-Pair Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/finish-as-white` and `/challenges/finish-as-black` surfaces on the canonical host and active deployment host.

The mutation should stay narrow: reuse the same single `gameId` field mutation shape already proven on `/challenges/finish-any-game`, submit one Chess.com-shaped value on both hosts for each side-aware finish route during one proof window, and capture the resulting post-submit state without widening into loss, draw, or account-setting mutations.

## Why this is the tightest remaining confidence extension

The current proof chain now covers both hosts in a signed-in browser context for the full eleven-route read-only catalog and one authenticated write-path mutation on the already-active generic finish challenge. That closes the smallest generic submit-path gap.

The next tightest extension is not a broad mutation sweep. It is one side-aware finish-pair mutation proof using the same already-shipped finish family surfaces that were previously read-only matched across both hosts. `/challenges/finish-as-white` and `/challenges/finish-as-black` are the narrowest follow-up because they stay in the same finish family, exercise the closest adjacent submission states, and extend confidence from one generic write path to the minimal paired branch without widening into other challenge families or deployment work.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/finish-as-black`
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window
- the same narrow Chess.com-shaped `gameId` mutation style already proven on `/challenges/finish-any-game`

It should preserve the same evidence style: exact URLs, concise visible before and after state, and one final dual-host authenticated submission-mutation parity verdict.

## Explicit deferrals

This next step does not include:

- mutation sweeps across the full challenge catalog
- loss-family or draw-family submission mutations
- account-setting mutations
- deployment work
- verifier rewrites

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, accept the same narrow submission mutation on `/challenges/finish-as-white` and `/challenges/finish-as-black`, render the same resulting post-submit state on each side-aware finish surface, and preserve matching signed-in account and challenge-list context around those mutations.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_FINISH_PAIR_NEXT_STEP_2026-04-12.md`.
