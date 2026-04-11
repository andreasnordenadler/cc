# Chess.com post-parity canonical-host catalog-integrity next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the canonical-host representative detail smoke check.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_SMOKE_2026-04-11.md` proves the canonical host root responds successfully and still shows the shipped Chess.com-supported home-entry wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` route responds successfully and still shows the shipped Chess.com-supported challenge-list wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_SMOKE_2026-04-11.md` proves one canonical-host representative detail route responds successfully and still shows the shipped Chess.com-supported submission wording.
- `docs/CHESSCOM_POST_PARITY_CATALOG_INTEGRITY_SMOKE_2026-04-11.md` already proves eleven-route Chess.com catalog integrity on the active deployment host.

## Exact next smallest step

Record one fresh active-live canonical-host catalog-integrity smoke proof on:

- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_CATALOG_INTEGRITY_SMOKE_2026-04-11.md`

## Why this is the tightest next move

After confirming canonical-host consistency on the home route, the challenge list surface, and one representative detail page, the narrowest remaining gap is whether the canonical host still exposes the full shipped eleven-challenge Chess.com-supported catalog rather than only the top-level wording. Rechecking catalog integrity on the already-proven `/challenges` route extends host-consistency coverage without widening into auth, submission replay, or a broader crawl.

## Explicit deferrals

This step does not:

- broaden into every detail route on the canonical host
- re-run auth or submission checks on the canonical host yet
- change product behavior, deployment config, or challenge logic
- start a wider canonical-host audit beyond the shipped catalog surface

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact canonical-host `/challenges` URL, confirm it returns successfully, and capture live proof that all eleven shipped Chess.com-supported challenge routes remain visible there.
