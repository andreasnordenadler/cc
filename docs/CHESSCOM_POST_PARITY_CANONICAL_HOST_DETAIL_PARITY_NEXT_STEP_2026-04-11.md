# Chess.com post-parity canonical-host representative-detail parity next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the dual-host challenge-list parity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_HOME_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host both return the shipped Chess.com-supported home route successfully during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host both return the shipped Chess.com-supported `/challenges` route successfully during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host both return the shipped boundary detail route `/challenges/lose-as-black` successfully during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_SMOKE_2026-04-11.md` already records a canonical-host representative-detail proof for `/challenges/win-as-white`.
- `docs/CHESSCOM_POST_PARITY_SMOKE_2026-04-11.md` already records the active deployment-host representative-detail proof for `/challenges/win-as-white`.

## Exact next smallest step

Record one fresh same-run dual-host parity smoke proof for the representative public challenge-detail route:

- canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- active deployment host: `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_PARITY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The current proof chain already covers same-run dual-host parity for the public home route, the public challenge-list route family, the signed-out auth/account surface, and one boundary detail route. The smallest remaining public same-slice comparison is now one representative non-boundary detail page. That extends confidence across the normal challenge-detail surface without widening into full detail-route crawling, signed-in browser work, or product changes.

## Explicit deferrals

This step does not:

- broaden into all-detail crawling or full catalog parity across every route
- rerun authenticated browser or Google sign-in testing
- change Clerk, Vercel, or application configuration
- add new challenges or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record both exact `/challenges/win-as-white` URLs, confirm both return successfully in the same proof window, and capture the matching shipped Chess.com-supported submission wording needed for dual-host parity.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_PARITY_NEXT_STEP_2026-04-11.md`.
