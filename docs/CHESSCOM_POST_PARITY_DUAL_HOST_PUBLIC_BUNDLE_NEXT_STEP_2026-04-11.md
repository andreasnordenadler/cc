# Chess.com post-parity dual-host public-bundle next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the completed dual-host representative-detail parity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_HOME_PARITY_SMOKE_2026-04-11.md` proves same-run dual-host parity on `/`.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_PARITY_SMOKE_2026-04-11.md` proves same-run dual-host parity on `/challenges` and captures the full eleven-route public catalog.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_PARITY_SMOKE_2026-04-11.md` proves same-run dual-host parity on the boundary detail route `/challenges/lose-as-black`.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_PARITY_SMOKE_2026-04-11.md` proves same-run dual-host parity on the representative detail route `/challenges/win-as-white`.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_PARITY_SMOKE_2026-04-11.md` already covers the signed-out protected `/account` surface separately.

## Exact next smallest step

Record one fresh same-run dual-host public-bundle smoke proof that rechecks the smallest representative public route set together:

- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`

and save it in:

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_PUBLIC_BUNDLE_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The route-by-route dual-host public proof chain is already complete. The smallest meaningful extension is now one same-run bundle recheck that confirms the canonical host and active deployment host still align across the core public surface family in a single proof window. That tightens confidence without widening into signed-in browser work, full-catalog crawling across every detail page, or any product changes.

## Explicit deferrals

This step does not:

- rerun authenticated browser or Google sign-in testing
- broaden into all-route crawling beyond the smallest representative public bundle
- change Clerk, Vercel, or application configuration
- add product features or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact four public-route URLs on both hosts, confirm they return successfully during the same proof window, and capture the shared Chess.com-supported wording needed to support a concise dual-host public-bundle parity verdict.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_DUAL_HOST_PUBLIC_BUNDLE_NEXT_STEP_2026-04-11.md`.
