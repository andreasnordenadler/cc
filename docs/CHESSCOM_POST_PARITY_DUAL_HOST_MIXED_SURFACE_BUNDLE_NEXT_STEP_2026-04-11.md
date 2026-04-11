# Chess.com post-parity dual-host mixed-surface bundle next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the completed dual-host public-bundle parity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_PUBLIC_BUNDLE_SMOKE_2026-04-11.md` proves same-run dual-host parity across the representative public bundle of `/`, `/challenges`, `/challenges/win-as-white`, and `/challenges/lose-as-black`.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_PARITY_SMOKE_2026-04-11.md` proves signed-out dual-host parity on `/account` as a protected-route surface.
- The earlier route-by-route dual-host proof chain already covers home, list, representative detail, boundary detail, and signed-out auth separately.

## Exact next smallest step

Record one fresh same-run dual-host mixed-surface bundle smoke proof that rechecks the smallest cross-surface set together:

- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/account`

and save it in:

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_MIXED_SURFACE_BUNDLE_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The public bundle already proved same-run parity across the representative public surface family. The smallest confidence extension now is one same-run mixed-surface bundle that confirms both hosts still align across one representative public entry route, one representative public detail route, and the signed-out protected `/account` edge in the same proof window. That extends evidence across the product's two visible surface classes without widening into signed-in browser work, full catalog crawling, or new product behavior.

## Explicit deferrals

This step does not:

- rerun authenticated browser or Google sign-in testing
- broaden into all public routes or all challenge detail routes
- change Clerk, Vercel, or application configuration
- add product features or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact three-route mixed bundle on both hosts, confirm the public routes return `200`, confirm `/account` returns the same signed-out protected response shape on both hosts during the same proof window, and capture concise public and auth evidence supporting a dual-host mixed-surface parity verdict.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_DUAL_HOST_MIXED_SURFACE_BUNDLE_NEXT_STEP_2026-04-11.md`.
