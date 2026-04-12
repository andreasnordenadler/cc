# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List-Plus-Coverage-Plus-Boundary-Plus-Win Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser triad-plus-list-plus-coverage-plus-boundary-plus-win Chess.com parity check across `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/lose-as-black`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, and one additional authenticated win-family detail route: `/challenges/win-as-white`.

## Why this is the tightest remaining confidence extension

The current authenticated proof chain already covers signed-in account context, the signed-in eleven-route challenge list, one completed generic finish surface, one untouched side-aware finish surface, one loss boundary surface, one generic draw surface, and one side-aware draw boundary surface. The smallest useful next extension is still to add only one more authenticated detail page.

`/challenges/win-as-white` is the tightest single add because it extends the same reviewable proof shape into the only major outcome family not yet represented in the current signed-in same-run bundle. That increases confidence across a distinct outcome-plus-color combination without widening into a broader authenticated crawl or any mutation flow.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/lose-as-black`
- `/challenges/draw-any-game`
- `/challenges/draw-as-black`

It should preserve the same proof style: one signed-in browser context, one shared proof window, exact canonical-host and active deployment-host URLs, concise visible evidence, and one final dual-host parity verdict.

## Explicit deferrals

This next step does not include:

- submission mutations
- broader authenticated crawling across the remaining challenge detail routes
- adding more than one extra authenticated detail route beyond `/challenges/win-as-white`
- deployment work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, render matching authenticated `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/lose-as-black`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, and `/challenges/win-as-white` surfaces, while preserving the same eleven-route signed-in list parity evidence on `/challenges`.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_PLUS_COVERAGE_PLUS_BOUNDARY_PLUS_WIN_NEXT_STEP_2026-04-12.md`.
