# Chess.com Post-Parity Dual-Host Authenticated Full-Catalog Submission-Mutation Bundle Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser full-catalog submission-mutation parity check across the signed-in `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/lose-any-game`, `/challenges/lose-as-black`, `/challenges/lose-as-white`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, `/challenges/draw-as-white`, `/challenges/win-as-white`, and `/challenges/win-as-black` surfaces on the canonical host and active deployment host.

Keep the mutation shape narrow and already proven: reuse the same single Chess.com-shaped `gameId` submission style already exercised route by route, run the submissions in one signed-in browser context during one proof window, and capture the immediate post-submit state on both hosts without widening into account-setting mutations, unrelated challenge families, deployment work, or verifier rewrites.

## Why this is the tightest remaining confidence extension

The current proof chain already covers both hosts in one signed-in browser context for the full eleven-route read-only catalog, one authenticated generic finish submission mutation, authenticated side-aware finish-pair submission mutation, authenticated side-aware win-pair submission mutation, authenticated side-aware loss-pair submission mutation, authenticated side-aware draw-pair submission mutation, authenticated generic draw submission mutation, and authenticated generic loss submission mutation.

That means every shipped Chess.com submission surface has now been proven individually. The smallest meaningful extension is no longer another per-route mutation proof. It is one same-run bundle that confirms the already proven narrow mutation behavior still holds coherently across the whole shipped challenge catalog inside one shared signed-in session and proof window on both hosts.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- all eleven shipped `/challenges/[id]` routes
- the same canonical host and active deployment host pair
- one signed-in browser context
- one shared proof window
- the same narrow Chess.com-shaped `gameId` mutation style already proven on each shipped submission route

It should preserve the same evidence style: exact URLs, concise visible before and after state, one shared proof window, and one final dual-host authenticated submission-mutation bundle parity verdict.

## Explicit deferrals

This next step does not include:

- account-setting mutations
- broader product mutations outside the shipped eleven-route challenge catalog
- deployment work
- verifier rewrites

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, expose matching signed-in `/account` and `/challenges` context, accept the same narrow submission mutation flow across all eleven shipped challenge routes, render matching post-submit states for each route, and end with a concise dual-host authenticated full-catalog submission-mutation parity verdict.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_FULL_CATALOG_SUBMISSION_MUTATION_BUNDLE_NEXT_STEP_2026-04-12.md`.
