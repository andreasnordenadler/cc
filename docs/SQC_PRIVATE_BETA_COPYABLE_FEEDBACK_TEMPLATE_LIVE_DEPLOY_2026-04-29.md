# SQC private beta copyable feedback template live deploy — 2026-04-29

## What changed
- Added a copy/paste feedback template to `/beta` so private-beta testers can send one compact, diagnostic report after a run.
- Template fields cover challenge tested, chess source, public username, optional game link, receipt outcome, fairness/readability, confusing moment, and screenshot status.
- Styled the template as a readable dashed proof card instead of plain buried text.

## Why
The private-beta flow already explains what feedback is useful, but friends still benefit from a single ready-to-copy structure. This reduces vague feedback and helps Andreas/Sam debug verifier and onboarding issues faster.

## Verification
- `pnpm install --frozen-lockfile` in clean worktree because `node_modules` was absent.
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview/production URL: `https://cc-927qblgoa-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://sidequestchess.com/beta` returned 200 and contained `Copy / paste template`, `One message is enough`, `Challenge tested:`, and `Receipt outcome: passed / failed / pending`.
  - `https://sidequestchess.com/account` returned 200 and retained private-beta preflight/test-drive copy.
  - `https://sidequestchess.com/connect` returned 200 and retained Lichess/Chess.com identity copy.
  - Preview `/beta` returned 200 and contained `Most confusing moment:`.

## Impact
Private beta testers now have an exact message format to send back, making feedback more actionable without adding any auth, data, or production-risk changes.
