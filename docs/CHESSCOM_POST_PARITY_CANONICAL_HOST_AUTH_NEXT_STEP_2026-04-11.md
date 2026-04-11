# Chess.com post-parity canonical-host auth-surface next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the canonical-host catalog-integrity smoke proof.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_SMOKE_2026-04-11.md` proves the canonical host root responds successfully and still shows the shipped Chess.com-supported home-entry wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` route responds successfully and still shows the shipped Chess.com-supported challenge-list wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_SMOKE_2026-04-11.md` proves one canonical-host representative detail route responds successfully and still shows the shipped Chess.com-supported submission wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` surface still exposes all eleven shipped Chess.com-supported challenge routes.
- `docs/CHESSCOM_POST_PARITY_AUTH_SMOKE_2026-04-11.md` already proves the expected auth-surface behavior on the active deployment host.

## Exact next smallest step

Record one fresh active-live canonical-host auth/account smoke proof on:

- `https://cc-andreas-nordenadlers-projects.vercel.app/account`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_SMOKE_2026-04-11.md`

## Why this is the tightest next move

After confirming canonical-host consistency on the home route, the challenge list route family, one representative detail page, and full catalog integrity, the narrowest remaining first-party gap is the protected account surface that stores Chess.com identity for the shipped loop. Rechecking that route on the canonical host extends host-consistency coverage without widening into submission replay, broader auth cleanup, or a full crawl.

## Explicit deferrals

This step does not:

- broaden into canonical-host submission replay or signed-in browser testing
- change Clerk configuration, deployment settings, or challenge logic
- widen into all protected route variants or another broader host audit
- re-open deployment-host checks already covered by earlier artifacts

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact canonical-host `/account` URL, confirm it returns the expected protected-route response, and capture live proof that the shipped Chess.com-aware account surface remains represented in the current behavior.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_AUTH_NEXT_STEP_2026-04-11.md`.
