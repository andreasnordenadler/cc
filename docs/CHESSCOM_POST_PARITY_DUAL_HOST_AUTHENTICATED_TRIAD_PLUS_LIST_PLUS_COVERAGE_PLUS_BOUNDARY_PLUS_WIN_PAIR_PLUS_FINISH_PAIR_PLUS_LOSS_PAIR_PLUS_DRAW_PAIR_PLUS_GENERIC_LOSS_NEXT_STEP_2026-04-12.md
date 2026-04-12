# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List-Plus-Coverage-Plus-Boundary-Plus-Win-Pair-Plus-Finish-Pair-Plus-Loss-Pair-Plus-Draw-Pair-Plus-Generic-Loss Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser triad-plus-list-plus-coverage-plus-boundary-plus-win-pair-plus-finish-pair-plus-loss-pair-plus-draw-pair-plus-generic-loss Chess.com parity check across `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/lose-any-game`, `/challenges/lose-as-black`, `/challenges/lose-as-white`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, `/challenges/draw-as-white`, `/challenges/win-as-white`, and `/challenges/win-as-black`.

## Why this is the tightest remaining confidence extension

The current authenticated proof chain already covers signed-in account context, the signed-in eleven-route challenge list, one completed generic finish surface, both side-aware finish surfaces, both side-aware loss surfaces, one generic draw surface, both side-aware draw surfaces, and both side-aware win surfaces.

The smallest useful next extension is to add only one more authenticated detail page. `/challenges/lose-any-game` is now the tightest single add because it completes the generic-loss coverage that still sits outside the signed-in detail proof chain while reusing the same narrow proof shape already established for the paired loss-family surfaces. That closes the remaining loss-family catalog gap without widening into submission mutation, broader authenticated crawling, or deployment work.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/finish-as-black`
- `/challenges/lose-as-black`
- `/challenges/lose-as-white`
- `/challenges/draw-any-game`
- `/challenges/draw-as-black`
- `/challenges/draw-as-white`
- `/challenges/win-as-white`
- `/challenges/win-as-black`

It should preserve the same proof style: one signed-in browser context, one shared proof window, exact canonical-host and active deployment-host URLs, concise visible evidence, and one final dual-host parity verdict.

## Explicit deferrals

This next step does not include:

- submission mutations
- broader authenticated crawling beyond the single added `/challenges/lose-any-game` detail surface
- deployment work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, render matching authenticated `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/lose-any-game`, `/challenges/lose-as-black`, `/challenges/lose-as-white`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, `/challenges/draw-as-white`, `/challenges/win-as-white`, and `/challenges/win-as-black` surfaces, while preserving the same eleven-route signed-in list parity evidence on `/challenges`.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_PLUS_COVERAGE_PLUS_BOUNDARY_PLUS_WIN_PAIR_PLUS_FINISH_PAIR_PLUS_LOSS_PAIR_PLUS_DRAW_PAIR_PLUS_GENERIC_LOSS_NEXT_STEP_2026-04-12.md`.
