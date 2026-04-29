# SQC Sam-run beta pass live deploy — 2026-04-29

## Change

Added a dedicated **Sam-run beta pass** section to `/beta` so Side Quest Chess can keep launch-readiness testing moving even when external friend testing is sparse.

The section gives Sam a repeatable internal beta checklist for:

- first-10-second concept clarity
- setup friction through identity → dare → proof
- pass/fail/pending receipt interpretation
- one highest-priority fix per internal beta pass

It also adds a copyable internal beta-pass template with clarity/friction scores and a friend-wave readiness decision.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

## Deploy

`vercel --prod --yes` succeeded.

- Preview deployment: `https://cc-2gxqcxicz-andreas-nordenadlers-projects.vercel.app`
- Production alias: `https://sidequestchess.com`

## Live smoke

- `https://cc-2gxqcxicz-andreas-nordenadlers-projects.vercel.app/beta` returned HTTP 200 and contained `Sam-run beta pass`, `Use internal testing when friend feedback will be sparse`, and `Setup friction score`.
- `https://sidequestchess.com/beta` returned HTTP 200 and contained the same Sam-run beta strings.
- `https://sidequestchess.com/account` returned HTTP 200 and still contained `Private beta preflight`.
- `https://sidequestchess.com/connect` returned HTTP 200 and still contained `Chess.com`.
