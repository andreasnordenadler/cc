# SQC rulebook live deploy — 2026-04-27

## What shipped

Added a public `/rules` Side Quest Chess rulebook/proof explainer that makes the product contract explicit:

- funny side quests still need serious, honest receipts
- pick a dare → play real Lichess/Chess.com games → check latest public games → share the receipt
- no PGN homework, no engine-analysis dashboard, no fake-success copy
- current verifier status names `Queen? Never Heard of Her` as the live-backed checker and `No Castle Club` as the next adapter shape

Also added `/rules` to primary nav and homepage CTAs/product cards.

## Files changed

- `src/app/rules/page.tsx`
- `src/components/site-nav.tsx`
- `src/app/page.tsx`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local smoke via Node `fetch` against existing dev server on `127.0.0.1:3011` ✅
  - `/` contained `Read the rulebook`
  - `/rules` contained `Funny dares. Serious receipts.`
  - `/challenges` returned Side Quest Chess content
  - `/proof-log` returned Side Quest Chess content

## Production deploy

- Command: `vercel --prod --yes` ✅
- Deployment: `https://cc-q4nqtxqj9-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com` ✅

## Production smoke

Node `fetch` checks passed:

- `https://sidequestchess.com/` contained `Read the rulebook` ✅
- `https://sidequestchess.com/rules` contained `Funny dares. Serious receipts.` ✅
- `https://sidequestchess.com/challenges` returned Side Quest Chess content ✅
- `https://sidequestchess.com/proof-log` returned Side Quest Chess content ✅
- `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` returned `image/png` ✅

## Vercel error scan

- `vercel logs https://cc-q4nqtxqj9-andreas-nordenadlers-projects.vercel.app --no-follow --since 30m --status-code 500 --limit 20` ✅
- Result: `No logs found for andreas-nordenadlers-projects/cc`

## Notes

A shell smoke attempt using `curl` failed because `curl` was not available in this environment, so route smoke was completed with Node 22 `fetch`. Logged as `.learnings/ERRORS.md`.
