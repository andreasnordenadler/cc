# SQC Proof Log Receipt State Clarity — Live Deploy

Date: 2026-05-04 02:55 Europe/Stockholm  
Project: CC / Side Quest Chess  
Deployment: https://cc-nj5q94pjs-andreas-nordenadlers-projects.vercel.app  
Canonical: https://sidequestchess.com/proof-log

## Change

Added a receipt-state explainer to `/proof-log` so testers understand pass, fail, and pending outcomes even before their account has saved proof history.

This tightens the core launch loop by making the saved proof area less empty/dead-ended:

- passed receipts explain sharing/daring back
- failed receipts explain rule review and retry
- pending receipts explain account preflight/latest-game cleanup
- support handoff remains one click away for confusing receipts

## Files changed

- `src/app/proof-log/page.tsx`
- `ROADMAP.md`

## Verification

Local:

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Deploy:

- `vercel --prod --yes` ✅
- Aliased to `https://sidequestchess.com` ✅
- `vercel inspect https://cc-nj5q94pjs-andreas-nordenadlers-projects.vercel.app --logs` shows deployment status `Ready` ✅

Live smoke:

- `https://cc-nj5q94pjs-andreas-nordenadlers-projects.vercel.app/proof-log` → HTTP 200 ✅
- `https://sidequestchess.com/proof-log` → HTTP 200 ✅
- `https://sidequestchess.com/result` → HTTP 200 ✅
- `https://sidequestchess.com/support` → HTTP 200 ✅
- Canonical `/proof-log` contains:
  - `Every proof check should tell testers what to do next.` ✅
  - `No mystery dead-end` ✅
  - `Run a latest-game check` ✅

## Notes

A first attempt to run `vercel logs <deployment> --since 15m` failed because this Vercel CLI path rejects filtering. I used `vercel inspect --logs` for deployment proof instead and logged the CLI gotcha in `.learnings/ERRORS.md`.
