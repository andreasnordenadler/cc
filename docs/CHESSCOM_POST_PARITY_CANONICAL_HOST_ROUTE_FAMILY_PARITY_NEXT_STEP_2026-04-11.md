# Chess.com post-parity canonical-host route-family parity next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the dual-host home parity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_HOME_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host both return the shipped Chess.com-supported home route successfully during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_SMOKE_2026-04-11.md` already records a canonical-host route-family proof for `/challenges`.
- `docs/CHESSCOM_POST_PARITY_LIST_SMOKE_2026-04-11.md` records the active deployment-host route-family proof for `/challenges`.
- `docs/CHESSCOM_POST_PARITY_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` confirms the active deployment host still exposes the shipped eleven-route Chess.com-supported challenge catalog on `/challenges`.

## Exact next smallest step

Record one fresh same-run dual-host parity smoke proof for the public challenge-list route family:

- canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- active deployment host: `https://cc-taupe-kappa.vercel.app/challenges`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_PARITY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The current proof chain already covers same-run dual-host parity for the boundary detail route, the signed-out auth/account surface, and the public home entry surface. The smallest remaining public same-slice comparison is now the `/challenges` route family, because both hosts already have individual route-family smoke evidence but not yet one same-run dual-host parity proof for the challenge list. That extends confidence across another highly visible public slice without widening into full catalog crawling, signed-in browser work, or product changes.

## Explicit deferrals

This step does not:

- broaden into authenticated browser or Google sign-in testing
- rerun full catalog-integrity parity across every challenge detail route
- change Clerk, Vercel, or application configuration
- add new challenges or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record both exact `/challenges` URLs, confirm both return successfully in the same proof window, and capture the matching shipped Chess.com-supported challenge-list wording needed for dual-host parity.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_PARITY_NEXT_STEP_2026-04-11.md`.
