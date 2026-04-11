# Chess.com post-parity canonical-host detail next step

Date: 2026-04-11
Owner: Sam
Status: done

## Objective

Define the smallest next proof-bearing follow-up after the canonical-host home-route and `/challenges` route-family smoke checks.

## Current evidence reused

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_SMOKE_2026-04-11.md` proves the canonical host root responds successfully and still shows the shipped Chess.com-supported home-entry wording.
- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_ROUTE_FAMILY_SMOKE_2026-04-11.md` proves the canonical host `/challenges` route responds successfully and still shows the shipped Chess.com-supported challenge-list wording.
- Earlier deployment-host post-parity smoke artifacts already cover representative detail, boundary detail, submission, auth, and catalog integrity on the active production target.

## Exact next smallest step

Record one fresh active-live canonical-host representative detail smoke proof on:

- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`

and save it in:

- `docs/CHESSCOM_POST_PARITY_CANONICAL_HOST_DETAIL_SMOKE_2026-04-11.md`

## Why this is the tightest next move

The remaining narrow confidence gap is whether the canonical host preserves the same Chess.com-supported wording on a representative challenge detail route, not just on the home and list surfaces. A single representative detail check extends host-consistency coverage one step deeper without widening into a full cross-host audit.

## Explicit deferrals

This step does not:

- broaden into all challenge detail routes
- re-run submission or auth checks on the canonical host yet
- change product behavior, deployment config, or challenge logic
- start a wider canonical-host crawl

## Acceptance for the next execution item

The follow-up smoke artifact should record the exact canonical-host detail URL, confirm it returns successfully, and capture live proof that the shipped Chess.com-supported submission wording remains visible there.
