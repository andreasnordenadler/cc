# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List-Plus-Coverage-Plus-Boundary-Plus-Win-Pair-Plus-Finish-Pair Next Step

Date: 2026-04-12
Defined by: Sam

## Exact next smallest step

Record one fresh same-run dual-host authenticated-browser triad-plus-list-plus-coverage-plus-boundary-plus-win-pair-plus-finish-pair Chess.com parity check across `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/lose-as-black`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, `/challenges/win-as-white`, and `/challenges/win-as-black`.

## Why this is the tightest remaining confidence extension

The current authenticated proof chain already covers signed-in account context, the signed-in eleven-route challenge list, one completed generic finish surface, one untouched side-aware finish surface for White, one loss boundary surface for Black, one generic draw surface, one side-aware draw boundary surface for Black, and the paired win-family detail surfaces for both colors.

The smallest useful next extension is still to add only one more authenticated detail page. `/challenges/finish-as-black` is the tightest single add because it completes the signed-in finish-family color pair while reusing the same family already covered by `/challenges/finish-any-game` and `/challenges/finish-as-white`. That expands confidence in the narrowest possible way without widening into another outcome family, submission mutation, or broader authenticated crawl.

## Reused proof chain

This next step should explicitly reuse the current signed-in proof chain for:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/lose-as-black`
- `/challenges/draw-any-game`
- `/challenges/draw-as-black`
- `/challenges/win-as-white`
- `/challenges/win-as-black`

It should preserve the same proof style: one signed-in browser context, one shared proof window, exact canonical-host and active deployment-host URLs, concise visible evidence, and one final dual-host parity verdict.

## Explicit deferrals

This next step does not include:

- submission mutations
- broader authenticated crawling across the remaining challenge detail routes
- adding more than one extra authenticated detail route beyond `/challenges/finish-as-black`
- deployment work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should show that both hosts, during one signed-in browser proof window, render matching authenticated `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, `/challenges/finish-as-black`, `/challenges/lose-as-black`, `/challenges/draw-any-game`, `/challenges/draw-as-black`, `/challenges/win-as-white`, and `/challenges/win-as-black` surfaces, while preserving the same eleven-route signed-in list parity evidence on `/challenges`.

## Verification note

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_PLUS_COVERAGE_PLUS_BOUNDARY_PLUS_WIN_PAIR_PLUS_FINISH_PAIR_NEXT_STEP_2026-04-12.md`.
