# SQC account test-drive checklist live deploy — 2026-04-28

## Change

Added a visible **End-to-end test drive** card to `/account` so Andreas can quickly verify the v1 loop:

1. save profile + Lichess username,
2. pick a starter side quest,
3. check latest games and review/share the result receipt.

This is intentionally a small product-clarity layer on top of the freshly shipped auth/profile work. It does not change verifier rules, Clerk auth, metadata shape, or production data.

## Files changed

- `src/app/account/page.tsx`
- `ROADMAP.md`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
  - Production deployment: `https://cc-rdms177zk-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-rdms177zk-andreas-nordenadlers-projects.vercel.app/account` → HTTP 200 and contains `Try the full SQC loop in five minutes.` + `manual QA path`
  - `https://sidequestchess.com/account` → HTTP 200 and contains `Try the full SQC loop in five minutes.` + `manual QA path`
  - `https://sidequestchess.com/profile` → HTTP 200
  - `https://sidequestchess.com/result` → HTTP 200
- Vercel production error-log scan ✅
  - `vercel logs --environment production --level error --since 10m --limit 50 --no-branch` returned `No logs found`.

## Impact

The signed-in account page now gives a concise manual QA path for the exact loop Andreas wanted to test: profile setup, username connection, quest selection, latest-game verification, and result receipt review.
