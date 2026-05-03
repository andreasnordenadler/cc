# SQC result launch-loop tightening live deploy — 2026-05-03

## Change

Tightened `/result` away from beta-reporting language and toward the core launch loop:

- Passed receipts now push share proof, badge, points, and inviting someone else.
- Failed receipts explain the rule miss and next attempt.
- Pending receipts point players back to a clean latest-game check.
- Replaced the beta report shortcut with a launch-loop block: `Share → Retry → Continue`.

## Files changed

- `src/app/result/page.tsx`
- `.learnings/ERRORS.md` (captured two local workflow gotchas from this burst)
- `ROADMAP.md`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-fwv5fnls1-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-fwv5fnls1-andreas-nordenadlers-projects.vercel.app/result` returned 200 and contained `Launch loop`, `From receipt to next quest`, `Open proof log`, `Start starter path`.
  - `https://sidequestchess.com/result` returned 200 and contained the same assertions.
  - `https://sidequestchess.com/proof-log` returned 200 and contained `Proof log`, `Open share card`.
  - `https://sidequestchess.com/share-kit` returned 200 and contained `10-second friend quest`, `Send the queenless quest`.
- Vercel production log check ✅/note
  - `vercel logs --environment production --level error --since 30m --limit 20 --no-branch --no-follow`
  - No 500/runtime error entries found; Vercel surfaced one existing warning for `/api/og/dare/early-king-walk` about unsupported `z-index` in OG rendering.

## User-visible impact

The result page now reads like a public-facing product loop instead of a beta feedback surface, making the receipt/share path clearer before broader launch polish.
