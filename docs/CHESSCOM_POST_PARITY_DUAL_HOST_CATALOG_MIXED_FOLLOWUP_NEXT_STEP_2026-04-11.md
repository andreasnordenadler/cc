# Chess.com Post-Parity Dual-Host Catalog-Mixed Follow-up Next Step

Date: 2026-04-11

## Context reused

The current proof chain already covers one same-run dual-host catalog-mixed parity slice across:

- `/challenges`
- `/challenges/win-as-white`
- `/challenges/lose-as-black`
- `/account`

That completed smoke proof established three things during one proof window:

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

This is the smallest useful follow-up because it adds only one missing public entry surface, `/`, to the already-proven dual-host catalog-mixed bundle. That extends confidence from catalog-plus-detail-plus-auth parity to entry-plus-catalog-plus-detail-plus-auth parity without widening into a broad crawl or a new product area.

The existing proof chain already shows that `/challenges`, representative detail, boundary detail, and signed-out `/account` align across both hosts. Rechecking those same routes while adding `/` gives one tighter mixed-surface bundle with minimal additional scope and preserves a same-run parity standard.

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

Verified locally on 2026-04-11 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_CATALOG_MIXED_FOLLOWUP_NEXT_STEP_2026-04-11.md`.
