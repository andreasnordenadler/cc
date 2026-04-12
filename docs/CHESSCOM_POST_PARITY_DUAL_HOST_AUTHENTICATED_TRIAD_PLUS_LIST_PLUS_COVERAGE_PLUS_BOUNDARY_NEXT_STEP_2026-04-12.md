# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List-Plus-Coverage-Plus-Boundary Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser triad-plus-list-plus-coverage-plus-boundary Chess.com parity check across `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/lose-as-black`, `/challenges/draw-any-game`, and one additional authenticated boundary detail route: `/challenges/draw-as-black`.

## Why this is the tightest remaining confidence extension

The current proof chain already narrows the next authenticated expansion to a same-run bundle that preserves signed-in account context, the signed-in eleven-route challenge list, the completed generic finish surface, the untouched side-aware finish surface, the loss boundary surface, and one added draw-family surface. The smallest useful next extension after that is to add only one more authenticated detail page.

`/challenges/draw-as-black` is the tightest single add because it keeps the same reviewable proof shape while extending coverage into a side-aware draw boundary that is not yet represented in the authenticated chain. That increases confidence in route parity across another distinct outcome-plus-color combination without widening into a broad authenticated crawl.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/lose-as-black`
- `/challenges/draw-any-game`

It should preserve the same proof style: one signed-in browser context, one shared proof window, exact canonical-host and active deployment-host URLs, concise visible evidence, and one final dual-host parity verdict.

## Explicit deferrals

This next step does not include:

- submission mutations
- broader authenticated crawling across remaining challenge detail pages
- adding more than one extra authenticated detail route beyond `/challenges/draw-as-black`
- deployment work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, render matching authenticated `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/lose-as-black`, `/challenges/draw-any-game`, and `/challenges/draw-as-black` surfaces, while preserving the same eleven-route signed-in list parity evidence on `/challenges`.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_PLUS_COVERAGE_PLUS_BOUNDARY_NEXT_STEP_2026-04-12.md`.
