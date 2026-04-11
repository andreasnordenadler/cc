# Chess.com post-parity dual-host catalog-mixed next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the completed dual-host full mixed-surface bundle smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_FULL_MIXED_SURFACE_BUNDLE_SMOKE_2026-04-11.md` proves same-run dual-host parity across `/`, `/challenges`, `/challenges/win-as-white`, `/challenges/lose-as-black`, and `/account`.
- `docs/CHESSCOM_POST_PARITY_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` proves the active deployment host `/challenges` surface still exposes the full eleven-challenge Chess.com-supported catalog.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` surface still exposes the same full eleven-challenge catalog.
- Earlier dual-host route-family and public-bundle proofs already show shared public wording on both hosts.

## Exact next smallest step

Record one fresh same-run dual-host catalog-mixed smoke proof that keeps scope tight while extending beyond the current representative mixed bundle:

- check `https://cc-andreas-nordenadlers-projects.vercel.app/challenges` and `https://cc-taupe-kappa.vercel.app/challenges`
- confirm both list all eleven shipped challenge routes during the same proof window
- recheck one representative detail route on both hosts: `/challenges/win-as-white`
- recheck one boundary detail route on both hosts: `/challenges/lose-as-black`
- recheck signed-out `/account` on both hosts

and save it in:

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_CATALOG_MIXED_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The full mixed-surface bundle already proved a stitched five-route parity slice. The smallest remaining confidence extension is to fold catalog integrity back into that same-run dual-host mixed check without widening into authenticated browsing or all detail pages individually. That proves the live list still exposes the full eleven-route Chess.com catalog on both hosts while the representative detail, boundary detail, and signed-out protected auth surface still match in the same proof window.

## Explicit deferrals

This step does not:

- rerun authenticated browser or Google sign-in testing
- fetch every challenge detail page individually
- change Clerk, Vercel, or application configuration
- add product features or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact canonical-host and active deployment-host URLs for `/challenges`, `/challenges/win-as-white`, `/challenges/lose-as-black`, and `/account`, confirm the `/challenges` responses expose all eleven shipped challenge routes on both hosts during the same proof window, and capture concise representative-detail, boundary-detail, and signed-out protected-route evidence supporting a dual-host catalog-mixed parity verdict.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_DUAL_HOST_CATALOG_MIXED_NEXT_STEP_2026-04-11.md`.
