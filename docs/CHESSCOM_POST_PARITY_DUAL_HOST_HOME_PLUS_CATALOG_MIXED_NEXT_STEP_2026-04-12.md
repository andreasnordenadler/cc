# Chess.com Post-Parity Dual-Host Home-Plus-Catalog Mixed Next Step

Date: 2026-04-12

## Context reused

The current proof chain already includes a completed same-run dual-host catalog-mixed parity smoke proof across:

- `/challenges`
- `/challenges/win-as-white`
- `/challenges/lose-as-black`
- `/account`

That latest proof established during one shared proof window that:

1. both hosts exposed the full eleven-route challenge catalog on `/challenges`
2. both hosts matched on one representative detail and one boundary detail route
3. both hosts matched on the signed-out protected `/account` response shape

## Smallest next step

Record one fresh same-run dual-host home-plus-catalog mixed parity smoke proof across these exact routes:

- canonical host `/`
- canonical host `/challenges`
- canonical host `/challenges/win-as-white`
- canonical host `/challenges/lose-as-black`
- canonical host `/account`
- active deployment host `/`
- active deployment host `/challenges`
- active deployment host `/challenges/win-as-white`
- active deployment host `/challenges/lose-as-black`
- active deployment host `/account`

## Why this is the tightest remaining confidence extension

This is the smallest useful follow-up because it adds only the public home entry surface, `/`, to the already-proven dual-host catalog-mixed bundle. That extends confidence from catalog-plus-detail-plus-auth parity to home-plus-catalog-plus-detail-plus-auth parity without widening into a broad crawl, authenticated browser work, or deployment activity.

The existing proof chain already shows that both hosts match on the challenge catalog, one representative detail route, one boundary detail route, and the signed-out protected account response. Rechecking those same routes while adding `/` preserves the same-run parity standard and creates the tightest next mixed-surface bundle from the current evidence.

## Required evidence

The follow-up artifact should:

- record the exact canonical-host and active deployment-host URLs for `/`, `/challenges`, `/challenges/win-as-white`, `/challenges/lose-as-black`, and `/account`
- confirm all ten checks complete during the same proof window
- confirm both `/challenges` responses still expose the full eleven shipped challenge routes during that same run
- capture concise visible wording evidence from `/`, the representative detail route, the boundary detail route, and the signed-out protected `/account` response
- end with a clear dual-host home-plus-catalog mixed parity verdict

## Explicit deferrals

This next step explicitly does not require:

- authenticated browser verification
- per-route crawling beyond the existing representative and boundary detail sample
- new deployment work
- product or UI changes

## Verification

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_HOME_PLUS_CATALOG_MIXED_NEXT_STEP_2026-04-12.md`.
