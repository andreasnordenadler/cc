# SQC proof-log receipt sharing live deploy — 2026-04-27

## Summary

Added per-receipt copy/share actions to the Side Quest Chess proof log so saved challenge attempts can be reused as individual shareable receipts, not only viewed in the latest `/result` card.

## User-visible change

- `/proof-log` now renders receipt-level sharing controls for saved attempts.
- Passed receipts copy badge-unlock language with challenge title and reward points.
- Failed/pending receipts copy the saved verifier summary instead of pretending success.
- The shared URL points to `/proof-log`, while the existing `/result` share card keeps its `/result` link.

## Files changed

- `src/app/proof-log/page.tsx`
- `src/components/share-proof-actions.tsx`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke on existing dev server:
  - `http://localhost:3011/proof-log` → `200`, contained `Side Quest Chess`
  - `http://localhost:3011/result` → `200`, contained `Side Quest Chess`
  - `http://localhost:3011/scoreboard` → `200`, contained `Side Quest Chess`
- Production deploy:
  - `vercel --prod --yes` ✅
  - Deployment: `https://cc-hg4o1q5g9-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Production smoke:
  - `https://sidequestchess.com/proof-log` → `200`, contained `Side Quest Chess`
  - `https://sidequestchess.com/result` → `200`, contained `Side Quest Chess`
  - `https://sidequestchess.com/scoreboard` → `200`, contained `Side Quest Chess`
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` → `200`
- Vercel production 500 scan:
  - `vercel logs --environment production --since 30m --status-code 500 --no-branch --limit 20` → `No logs found`

## Notes

One attempted log command used a deployment URL with `--since`, which Vercel CLI treats as implicit follow mode and rejects. Re-ran the production log scan at project scope with `--no-branch`, which succeeded.
