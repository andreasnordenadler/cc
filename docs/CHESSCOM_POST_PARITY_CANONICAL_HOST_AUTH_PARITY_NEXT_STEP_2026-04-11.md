# Chess.com post-parity canonical-host auth parity next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the dual-host boundary-detail parity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_PARITY_SMOKE_2026-04-11.md` proves the canonical host and active deployment host both return the boundary detail route `/challenges/lose-as-black` successfully with the same shipped Chess.com-supported wording during the same proof window.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_SMOKE_2026-04-11.md` proves the canonical host `/account` route returns the expected signed-out protected Clerk response while preserving Chess.com-aware account-surface evidence.
- `docs/CHESSCOM_POST_PARITY_AUTH_SMOKE_2026-04-11.md` proves the active deployment host `/account` route returns the same narrow signed-out protected-route shape with Chess.com-aware account-surface evidence.
- `docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md` and `docs/LIVE_ROUTE_CHECK_2026-04-09.md` already defer broader signed-in browser validation and show that the remaining surface to compare narrowly is the signed-out/raw auth response shape.

## Exact next smallest step

Record one fresh same-run dual-host parity smoke proof for the signed-out auth/account surface:

- canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- active deployment host: `https://cc-taupe-kappa.vercel.app/account`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_PARITY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The current proof chain already covers public root, list, representative detail, boundary detail, full catalog integrity, and host-to-host parity for one boundary route. The smallest remaining same-slice host comparison is the signed-out `/account` surface, because both hosts already have individual auth-smoke evidence but not yet one same-run parity proof. That extends confidence on the last narrow shipped surface without widening into signed-in browser flows, Clerk changes, or broader crawling.

## Explicit deferrals

This step does not:

- broaden into authenticated browser or Google sign-in testing
- change Clerk configuration, Vercel settings, or redirects
- add all-route dual-host crawling
- reopen challenge logic, UI, or deployment work

## Acceptance for the next execution item

The follow-up smoke artifact should record both exact `/account` URLs, confirm both return the same expected signed-out protected-route response shape in the same proof window, and capture the matching Chess.com-aware account-surface evidence or headers needed for parity.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_PARITY_NEXT_STEP_2026-04-11.md`.
