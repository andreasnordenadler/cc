# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List Next Step

Date: 2026-04-12
Owner: Sam
Status: complete

## Context

The latest completed proof chain already covers:

- dual-host authenticated `/account` parity
- dual-host authenticated representative detail parity on `/challenges/finish-any-game`
- dual-host authenticated boundary detail parity on `/challenges/lose-as-black`
- same-run authenticated mini-bundle parity across `/account`, `/challenges/finish-any-game`, and `/challenges/lose-as-black`
- same-run authenticated full-catalog detail-sweep parity across `/account`, `/challenges`, and all eleven shipped `/challenges/[id]` routes
- same-run authenticated state-diversity parity across `/account`, `/challenges/finish-any-game`, and `/challenges/finish-as-white`
- same-run authenticated challenge-state-triad parity across `/challenges/finish-any-game`, `/challenges/finish-as-white`, and `/challenges/lose-as-black`

## Smallest next step

Record one fresh same-run signed-in dual-host authenticated triad-plus-list parity check across:

- `/account`
- `/challenges`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/lose-as-black`

using the canonical host and the active deployment host in one signed-in browser context.

## Why this is the tightest next extension

This is the smallest remaining confidence extension because it reuses the already-proven signed-in account surface, the already-proven authenticated full catalog surface, and the most recent authenticated challenge-state triad, but asks for one new same-run bundle that reconnects list-level catalog visibility with the signed-in triad routes in a single proof window.

That gives a tighter authenticated bundle than the triad alone, without widening scope into submission mutations, broader authenticated crawling, or deployment work.

## What to capture in the follow-up proof

The follow-up smoke artifact should:

- record the exact canonical-host and active deployment-host signed-in URLs for all five route families above
- confirm all ten checks complete during one shared proof window in one signed-in browser session
- confirm both signed-in `/challenges` surfaces expose the same full eleven shipped challenge routes during that run
- capture concise shared visible evidence for signed-in account context plus completed, untouched side-aware, and boundary challenge-detail states
- end with a concise authenticated triad-plus-list parity verdict

## Explicit deferrals

This next step explicitly defers:

- submission mutations
- broader authenticated crawling beyond the five-route bundle above
- new product work
- deployment or auth-configuration changes

## Verification

Verified artifact exists locally at `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_NEXT_STEP_2026-04-12.md`.
