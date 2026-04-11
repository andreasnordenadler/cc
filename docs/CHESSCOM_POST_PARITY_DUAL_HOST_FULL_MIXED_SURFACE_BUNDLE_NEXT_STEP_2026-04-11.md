# Chess.com post-parity dual-host full mixed-surface bundle next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the completed dual-host expanded mixed-surface bundle smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_MIXED_SURFACE_EXPANDED_BUNDLE_SMOKE_2026-04-11.md` proves same-run dual-host parity across `/`, `/challenges`, `/challenges/win-as-white`, and `/account`.
- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_PUBLIC_BUNDLE_SMOKE_2026-04-11.md` already proves same-run dual-host public parity across `/`, `/challenges`, `/challenges/win-as-white`, and `/challenges/lose-as-black`.
- Earlier route-by-route dual-host proofs already cover the boundary detail route `/challenges/lose-as-black` and the signed-out protected `/account` surface separately.

## Exact next smallest step

Record one fresh same-run dual-host full mixed-surface bundle smoke proof that rechecks this smallest fully stitched mixed set together:

- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- `https://cc-taupe-kappa.vercel.app/account`

and save it in:

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_FULL_MIXED_SURFACE_BUNDLE_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The expanded mixed-surface bundle already proved entry, list, representative detail, and signed-out protected auth behavior in one proof window. The smallest remaining confidence extension is to add one boundary public detail route back into that same-run mixed bundle, because that closes the last gap between the broader public-bundle parity proof and the narrower mixed-surface auth proof without widening into catalog-wide crawling or authenticated browsing.

## Explicit deferrals

This step does not:

- rerun authenticated browser or Google sign-in testing
- broaden into all detail routes or full catalog crawling
- change Clerk, Vercel, or application configuration
- add product features or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact five-route mixed bundle on both hosts, confirm the four public routes return `200`, confirm `/account` returns the same signed-out protected response shape on both hosts during the same proof window, and capture concise public plus auth evidence supporting a dual-host full mixed-surface parity verdict.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_DUAL_HOST_FULL_MIXED_SURFACE_BUNDLE_NEXT_STEP_2026-04-11.md`.
