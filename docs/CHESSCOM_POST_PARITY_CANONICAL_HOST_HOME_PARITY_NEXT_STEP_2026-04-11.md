# Chess.com post-parity canonical-host home parity next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the dual-host auth/account parity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host return the same signed-out protected `/account` response shape with matching Chess.com-aware account metadata during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host both return the boundary detail route `/challenges/lose-as-black` successfully with the same shipped Chess.com-supported wording during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_SMOKE_2026-04-11.md` already records a canonical-host home-route proof, and `docs/CHESSCOM_POST_PARITY_ENTRY_SMOKE_2026-04-11.md` records the active deployment-host home-route proof.

## Exact next smallest step

Record one fresh same-run dual-host parity smoke proof for the public home entry surface:

- canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/`
- active deployment host: `https://cc-taupe-kappa.vercel.app/`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_HOME_PARITY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The current proof chain already covers dual-host parity on one public boundary detail route and the signed-out auth/account surface. The smallest remaining public same-slice comparison is the home entry route, because both hosts already have individual home smoke evidence but not yet one same-run dual-host parity proof for the root surface. That extends confidence on the most visible shipped page without broadening into list-wide crawling, authenticated flows, or product changes.

## Explicit deferrals

This step does not:

- broaden into authenticated browser or Google sign-in testing
- recheck every public route or rerun catalog-integrity parity
- change Clerk, Vercel, or application configuration
- add new challenges or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record both exact `/` URLs, confirm both return successfully in the same proof window, and capture the matching shipped Chess.com-supported home-entry wording needed for dual-host parity.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_HOME_PARITY_NEXT_STEP_2026-04-11.md`.
