# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser submission-mutation Chess.com parity check on the already-active `/challenges/finish-any-game` surface across the canonical host and active deployment host.

The mutation should stay as narrow as possible: change only one existing submission input value on the active signed-in challenge flow, submit it on both hosts during one proof window, and capture the resulting post-submit state without widening to any other challenge family.

## Why this is the tightest remaining confidence extension

The current proof chain already covers the full shipped eleven-route catalog in a signed-in browser context across both hosts, including `/account`, `/challenges`, and every shipped challenge detail route. That closes the read-only parity gap.

The smallest meaningful remaining extension is no longer another view-only page check. It is one controlled write-path proof on an already-active challenge that is known to expose submission controls. `/challenges/finish-any-game` is the tightest target because it already has active signed-in state, existing recent-submission evidence, and completed-loop context in the current artifacts, so one narrow mutation here extends confidence into the authenticated submit path without broadening scope.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window

It should preserve the same evidence style: exact URLs, concise visible state before and after submission, and one final dual-host parity verdict.

## Explicit deferrals

This next step does not include:

- multi-route submission sweeps
- starting or mutating additional challenge families
- deployment work
- verifier rewrites
- broad authenticated crawling beyond the single active challenge write path

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, accept the same narrow submission mutation on `/challenges/finish-any-game`, render the same resulting post-submit state, and preserve matching signed-in account and challenge-list context around that mutation.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_NEXT_STEP_2026-04-12.md`.
