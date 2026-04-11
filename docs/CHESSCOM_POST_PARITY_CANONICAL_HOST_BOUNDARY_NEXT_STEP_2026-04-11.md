# Chess.com post-parity canonical-host boundary-detail next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the canonical-host auth-surface smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_SMOKE_2026-04-11.md` proves the canonical host root responds successfully and still shows the shipped Chess.com-supported home-entry wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` route responds successfully and still shows the shipped Chess.com-supported challenge-list wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_SMOKE_2026-04-11.md` proves one canonical-host representative detail route responds successfully and still shows the shipped Chess.com-supported submission wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` surface still exposes all eleven shipped Chess.com-supported challenge routes.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_SMOKE_2026-04-11.md` proves the canonical host `/account` route still returns the expected protected Clerk response while preserving Chess.com-aware account-surface metadata.
- `docs/CHESSCOM_POST_PARITY_BOUNDARY_SMOKE_2026-04-11.md` already proves a boundary detail route behaves correctly on the active deployment host.

## Exact next smallest step

Record one fresh active-live canonical-host boundary detail smoke proof on:

- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_BOUNDARY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

After confirming canonical-host consistency for the home route, challenge-list route family, representative detail page, full catalog integrity, and protected account surface, the narrowest remaining first-party content gap is one boundary challenge detail route. Rechecking the boundary page extends canonical-host confidence to the edge of the shipped challenge set without widening into full-route crawling, signed-in browser work, or deployment/config changes.

## Explicit deferrals

This step does not:

- broaden into canonical-host submission replay or authenticated browser testing
- change Clerk configuration, deployment settings, or challenge logic
- widen into all detail routes or a full canonical-host crawl
- re-open deployment-host checks already covered by earlier artifacts

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact canonical-host boundary detail URL, confirm it returns successfully, and capture live proof that the shipped Chess.com-supported submission wording remains visible on that page.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_BOUNDARY_NEXT_STEP_2026-04-11.md`.
