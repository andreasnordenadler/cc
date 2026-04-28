# SQC account quest launcher live deploy — 2026-04-28

## Change

Added a Quest launcher section to `/account` so the account test-drive path now includes every live-backed starter dare directly on the account page.

Signed-in runners can make any starter dare active from `/account`; signed-out visitors see direct rule-preview links. The section also surfaces badge art, difficulty, reward points, and live-backed verifier status for each starter challenge.

## Files changed

- `src/app/account/page.tsx`
- `src/app/globals.css`
- `ROADMAP.md`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy: `vercel --prod --yes` ✅
  - Deployment: `https://cc-blg3xvowx-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-blg3xvowx-andreas-nordenadlers-projects.vercel.app/account` returned HTTP 200 and contained `Quest launcher`, `Pick a live-backed dare`, and `Preview rules`.
  - `https://sidequestchess.com/account` returned HTTP 200 and contained `Quest launcher`, `Pick a live-backed dare`, and `Preview rules`.
  - `https://sidequestchess.com/challenges` returned HTTP 200.
  - `https://sidequestchess.com/result` returned HTTP 200.
- Vercel deployment log stream opened for `dpl_HHKzVX5n5GYouKVpQdR8Sq2GQ7pZ`; no fresh error output appeared during the bounded post-deploy watch window.

## User-visible effect

Andreas can now test the SQC account flow from one page: sign in, edit profile/usernames, pick a live-backed quest, check latest games, and review the result receipt.
