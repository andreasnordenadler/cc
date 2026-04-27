# SQC daily dare live deploy — 2026-04-27

## What shipped

Added a first-class `/today` daily side quest surface for Side Quest Chess.

- New daily dare route: `/today`
- Deterministic daily challenge selector: `getDailyChallenge()`
- Primary nav now exposes `Today`
- Homepage hero and product-surface cards link into the daily dare
- Daily page shows the shared challenge, reward, difficulty, badge target, rules, and copy/native-share actions
- The daily share action links to `/today`, making the same bad idea easy to send as a repeatable ritual

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local smoke on dev server `http://127.0.0.1:3011`: `/`, `/today`, `/challenges`, `/dare/queen-never-heard-of-her` ✅
- Production deploy: `vercel --prod --yes` ✅
  - Deployment: `https://cc-dg9i5ts54-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Production smoke with browser user-agent ✅
  - `https://sidequestchess.com/` → 200 + Side Quest Chess content
  - `https://sidequestchess.com/today` → 200 + daily-dare content
  - `https://sidequestchess.com/challenges` → 200 + Side Quest Chess content
  - `https://sidequestchess.com/dare/queen-never-heard-of-her` → 200 + Side Quest Chess content
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` → 200 + PNG image data
- Vercel production 500/501/502/503/504 log scan for last 10 minutes ✅
  - No matching production log entries found

## Notes

The route is deliberately lightweight and non-destructive: no new data writes, no provider credentials, no PGN upload/import framing, and no change to the verifier logic. It adds a visible daily ritual on top of the existing challenge/badge/friend-dare loop.
