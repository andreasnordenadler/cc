# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List-Plus-Coverage Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser triad-plus-list-plus-coverage Chess.com parity check across `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/lose-as-black`, and one additional authenticated detail route: `/challenges/draw-any-game`.

## Why this is the tightest remaining confidence extension

The completed authenticated triad-plus-list proof already reuses one signed-in browser run to cover shared account context, the full eleven-route signed-in challenge list, an active/completed finished-game detail surface, an untouched side-aware finish surface, and a boundary loss surface on both hosts. The smallest meaningful coverage extension now is to widen that same proof bundle by only one additional authenticated challenge detail surface.

`/challenges/draw-any-game` is the tightest single add because it introduces one new shipped outcome family that is not yet represented in the authenticated proof chain, while keeping the surface generic and reviewable. That adds new confidence without widening into a broad authenticated crawl.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain from the completed same-run dual-host authenticated checks for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/lose-as-black`

It should keep the same proof style: one signed-in browser context, one shared proof window, exact canonical-host and active deployment-host URLs, concise visible evidence, and a final dual-host parity verdict.

## Explicit deferrals

This next step does not include:

- submission mutations
- broader authenticated crawling across all remaining detail pages
- adding more than one extra authenticated detail route
- deployment work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, render matching authenticated `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/lose-as-black`, and `/challenges/draw-any-game` surfaces, while preserving the same eleven-route list parity evidence already established on `/challenges`.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_PLUS_COVERAGE_NEXT_STEP_2026-04-12.md`.
