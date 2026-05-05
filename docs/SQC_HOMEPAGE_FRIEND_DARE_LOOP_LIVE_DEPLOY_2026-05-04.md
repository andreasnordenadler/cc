# SQC homepage friend quest loop — live deploy proof

Date: 2026-05-04 11:44–12:05 Europe/Stockholm  
Owner: Sam  
Project: CC / Side Quest Chess

## What changed

Added a homepage `Friend quest loop` block that explains the core viral/private-beta loop in plain language:

1. pick today’s quest,
2. send the exact quest link,
3. compare proof receipts after latest-game checks.

The block links directly to `/today`, `/share-kit`, and `/proof-log` so a new tester can understand Side Quest Chess as “send one terrible chess quest and compare receipts” without hunting through the rest of the app.

## Files changed

- `src/app/page.tsx`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
- Live smoke on preview `/` ✅ — HTTP 200 and homepage contains `Friend quest loop`, `Send one terrible quest, then compare receipts`, `Use today’s quest`, `Open share kit`, and `Compare receipts`
- Live smoke on canonical `/` ✅ — same content assertions passed
- Live smoke on canonical `/share-kit` ✅ — HTTP 200 with share/proof route markers
- Live smoke on canonical `/proof-log` ✅ — HTTP 200 with proof-log route markers
- Vercel error-log scan for the new deployment ✅ — `No logs found` / `recent_error_logs=0`

## Live deployment

- Preview deployment: `https://cc-211ap4wrf-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`
