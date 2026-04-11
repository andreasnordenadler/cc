# Chess.com Post-Parity Dual-Host Full Catalog Detail Sweep Next Step

Date: 2026-04-12

## Context reused

The current proof chain already includes a completed same-run dual-host home-plus-catalog mixed parity smoke proof across:

- `/`
- `/challenges`
- `/challenges/win-as-white`
- `/challenges/lose-as-black`
- `/account`

That latest proof established during one shared proof window that:

1. both hosts exposed the same Chess.com-supported home surface
2. both hosts exposed the full eleven-route challenge catalog on `/challenges`
3. both hosts matched on one representative detail and one boundary detail route
4. both hosts matched on the signed-out protected `/account` response shape

## Smallest next step

Record one fresh same-run dual-host full catalog detail sweep smoke proof across these exact routes:

- canonical host `/challenges`
- canonical host all eleven shipped `/challenges/[id]` routes
- canonical host `/account`
- active deployment host `/challenges`
- active deployment host all eleven shipped `/challenges/[id]` routes
- active deployment host `/account`

## Why this is the tightest remaining confidence extension

This is the smallest useful follow-up because the current proof chain already covers the home surface, the catalog list surface, one representative detail surface, one boundary detail surface, and the signed-out protected account surface on both hosts in one shared run. The tightest remaining gap is the unverified middle of the shipped challenge-detail catalog.

A same-run dual-host full catalog detail sweep closes that gap without widening into authenticated browser work, mutation testing, or deployment work. It reuses the already-proven `/challenges` catalog integrity evidence, then confirms that every shipped Chess.com-supported detail route still serves consistently on both hosts during one proof window.

## Required evidence

The follow-up artifact should:

- record the exact canonical-host and active deployment-host URLs for `/challenges`, all eleven shipped `/challenges/[id]` routes, and `/account`
- confirm all twenty-six checks complete during the same proof window
- confirm both `/challenges` responses still expose the full eleven shipped challenge routes during that same run
- capture concise visible wording evidence showing the full detail sweep still presents the shipped Lichess-and-Chess.com-supported flow on both hosts
- capture the signed-out protected `/account` parity shape again in the same run
- end with a clear dual-host full catalog detail sweep parity verdict

## Explicit deferrals

This next step explicitly does not require:

- authenticated browser verification
- challenge submission mutations
- product or UI changes
- new deployment work

## Verification

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_FULL_CATALOG_DETAIL_SWEEP_NEXT_STEP_2026-04-12.md`.
