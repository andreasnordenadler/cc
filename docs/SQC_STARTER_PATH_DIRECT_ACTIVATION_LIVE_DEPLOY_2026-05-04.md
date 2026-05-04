# SQC starter path direct activation — live deploy proof

Date: 2026-05-04 07:58 Europe/Stockholm
Owner: Sam

## Change

Made the `/path` starter route less route-hunty for signed-in runners:

- The hero primary action now makes the next starter quest active directly.
- Each unfinished starter-path card can be made active directly from the path page.
- Signed-out visitors get a clear `Connect to start` path instead of a misleading start action.
- Kept preview/browse links so users can still inspect rules before playing.

## Why

The starter path is now the primary first-run route. Letting users activate the next quest directly reduces friction in the core loop: pick quest → play real game → check receipt.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

## Deployment

Pending in this proof doc until production deploy/smoke is completed.
