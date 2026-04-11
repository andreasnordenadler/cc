# Chess.com post-parity canonical-host parity next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the canonical-host boundary-detail smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_SMOKE_2026-04-11.md` proves the canonical host root responds successfully and still shows the shipped Chess.com-supported home-entry wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` route responds successfully and still shows the shipped Chess.com-supported challenge-list wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_SMOKE_2026-04-11.md` proves a representative canonical-host detail route responds successfully and still shows the shipped Chess.com-supported submission wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` surface still exposes all eleven shipped Chess.com-supported challenge routes.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_SMOKE_2026-04-11.md` proves the canonical host `/account` route still returns the expected protected Clerk response while preserving Chess.com-aware account-surface metadata.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_BOUNDARY_SMOKE_2026-04-11.md` proves the canonical host boundary detail route `/challenges/lose-as-black` returns successfully and still shows the shipped Chess.com-supported submission wording.
- `docs/CHESSCOM_POST_PARITY_BOUNDARY_SMOKE_2026-04-11.md` already proves the same boundary route behaves correctly on the active deployment host.

## Exact next smallest step

Record one fresh same-run dual-host parity smoke proof for the shipped boundary detail route:

- canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- active deployment host: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_PARITY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The canonical host now has direct proof for root, list, representative detail, full catalog integrity, auth surface, and boundary detail. The smallest remaining confidence extension is not another new route, but one narrow host-to-host parity recheck on the already-proven boundary page. That gives a direct same-slice canonical-vs-deployment comparison without widening into a full crawl, signed-in browser work, or deployment changes.

## Explicit deferrals

This step does not:

- broaden into all-route or all-host crawling
- add authenticated browser testing or submission replay
- change Clerk configuration, deployment settings, or challenge logic
- reopen broader product or UX work

## Acceptance for the next execution item

The follow-up smoke artifact should record both exact live URLs, confirm both return successfully, and capture that the shipped Chess.com-supported boundary detail wording is visible on both hosts during the same proof window.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_PARITY_NEXT_STEP_2026-04-11.md`.
