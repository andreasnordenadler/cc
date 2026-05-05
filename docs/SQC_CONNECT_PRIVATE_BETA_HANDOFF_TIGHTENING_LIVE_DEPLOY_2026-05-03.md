# SQC Connect Private Beta Handoff Tightening — 2026-05-03

## Change

Tightened the `/connect` handoff so private-beta testers are guided from identity setup into the actual first proof loop.

- Renamed the handoff to `Private beta connection handoff`.
- Clarified that the next step is the private-beta starter route, not open-ended browsing.
- Changed the second step to `Start a tester-route quest` with copy that discourages browsing the full chaos deck cold.
- Added a primary link to `/account` preflight plus starter-route and receipt links.

## Verification

Local:

- `pnpm lint` ✅
- `pnpm build` ✅

Production deploy:

- Deploy URL: `https://cc-b7h94co4k-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

Live smoke after deploy:

- `https://cc-b7h94co4k-andreas-nordenadlers-projects.vercel.app/connect` returned HTTP 200 and contained `Private beta connection handoff`, `Open account preflight`, and `Open starter route` ✅
- `https://sidequestchess.com/connect` returned HTTP 200 and contained the same handoff strings ✅
- `https://sidequestchess.com/account` returned HTTP 200 and retained `Private beta preflight` ✅
- `https://sidequestchess.com/beta` returned HTTP 200 and retained `full dual-host deck` plus `All ten current starter-deck quests` ✅
- `https://sidequestchess.com/support` returned HTTP 200, confirming the newer support route from `origin/main` stayed live after redeploy ✅
- Vercel production 500 scan found no logs: `vercel logs --project cc --environment production --status-code 500 --since 30m --no-branch --no-follow --limit 20` ✅

## Impact

The connect page now better supports private/friends beta: after saving a chess identity, testers are nudged into account preflight, the starter route, and one latest-game receipt instead of treating connection as the end of setup.
