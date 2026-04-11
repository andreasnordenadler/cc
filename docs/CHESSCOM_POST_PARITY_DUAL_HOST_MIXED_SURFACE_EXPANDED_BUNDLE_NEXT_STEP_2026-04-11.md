# Chess.com post-parity dual-host mixed-surface expanded bundle next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the completed dual-host representative mixed-surface bundle smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_MIXED_SURFACE_BUNDLE_SMOKE_2026-04-11.md` proves same-run dual-host parity across `/`, `/challenges/win-as-white`, and `/account`.
- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_PUBLIC_BUNDLE_SMOKE_2026-04-11.md` already proves same-run dual-host parity across the broader public bundle of `/`, `/challenges`, `/challenges/win-as-white`, and `/challenges/lose-as-black`.
- The earlier route-by-route dual-host proof chain already covers home, list, representative detail, boundary detail, and signed-out auth separately.

## Exact next smallest step

Record one fresh same-run dual-host expanded mixed-surface bundle smoke proof that rechecks this smallest broadened mixed set together:

- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/account`

and save it in:

- `docs/CHESSCOM_POST_PARITY_DUAL_HOST_MIXED_SURFACE_EXPANDED_BUNDLE_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The representative mixed-surface bundle already proved one public entry route, one representative public detail route, and the signed-out protected edge in a single proof window. The smallest remaining confidence extension is to add the public list surface back into that same-run mixed bundle without widening into the full catalog or authenticated browsing. That gives one concise same-window read across entry, route-family, representative detail, and protected auth behavior on both hosts.

## Explicit deferrals

This step does not:

- rerun authenticated browser or Google sign-in testing
- broaden into all public detail routes or full catalog crawling
- change Clerk, Vercel, or application configuration
- add product features or reopen deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact four-route mixed bundle on both hosts, confirm the three public routes return `200`, confirm `/account` returns the same signed-out protected response shape on both hosts during the same proof window, and capture concise public plus auth evidence supporting a dual-host expanded mixed-surface parity verdict.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_DUAL_HOST_MIXED_SURFACE_EXPANDED_BUNDLE_NEXT_STEP_2026-04-11.md`.
