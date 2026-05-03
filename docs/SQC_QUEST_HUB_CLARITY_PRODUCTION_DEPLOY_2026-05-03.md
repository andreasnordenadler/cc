# SQC quest-hub clarity production deploy proof — 2026-05-03

## Summary

Deployed the latest clean `origin/main` Side Quest Chess build to production so the recent private-beta polish work is live on `https://sidequestchess.com`.

This production cut includes the latest quest-loop clarity commits through `4bf44a8` (`Remove quest hub status summary`), including the cleaner quest hub cards/flow and simplified homepage/private-beta routing already merged on main.

## Deployment

- Source commit: `4bf44a8 Remove quest hub status summary`
- Production deployment: `https://cc-64qupdy4e-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`
- Command: `vercel --prod --yes`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy build ✅
- Live smoke checks ✅
  - Deploy `/` returned 200 and included `Chess, but with stupidly hard side quests.` plus `Pick → play → prove`
  - Canonical `/` returned 200 with the same homepage loop copy
  - Canonical `/challenges` returned 200 and included `Pick your next bad idea.` plus `Recommended starter route`
  - Canonical `/beta` returned 200 and included `Friends / private beta` plus `full dual-host deck`
  - Canonical `/support` returned 200 and included support/password trust copy
- Recent Vercel production 500 scan ✅
  - `node /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs --project cc --since 30m`
  - Result: `total: 0`

## Impact

The canonical site now serves the latest clearer private-beta quest hub/home/beta flow from main, with live proof that the homepage, quest hub, beta notes, and support surface are reachable and rendering the expected copy.
