# SQC quest-detail friend-dare handoff — live deploy proof

Date: 2026-05-04 20:52 Europe/Stockholm  
Owner: Sam  
Project: CC / Side Quest Chess

## What changed

Added a quest-specific friend-dare handoff directly to `/challenges/[id]` detail pages so a runner can copy/share the exact bad idea from the rules page without first hunting for the separate friend-quest route.

The panel includes:

- `Friend dare` framing
- `Send exactly this bad idea.` headline
- copy/share actions using the existing quest-specific `/dare/[id]` invite path
- quest title, objective, badge, reward, and proof link in the copied invite

## Files changed

- `src/app/challenges/[id]/page.tsx`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-4na7vkqp2-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-4na7vkqp2-andreas-nordenadlers-projects.vercel.app/challenges/knights-before-coffee` contains `Friend dare`, `Send exactly this bad idea.`, and `Copy friend quest`
  - `https://sidequestchess.com/challenges/knights-before-coffee` contains `Friend dare`, `Send exactly this bad idea.`, and `Copy friend quest`
  - `/dare/knights-before-coffee` returns HTTP 200 on both deploy and canonical domains
- Vercel production 500 scan ✅
  - `vercel logs --environment production --since 30m --status-code 500 --no-branch --limit 20`
  - Result: no logs found

## Impact

The core quest loop is more obvious: browse/read rules → start/play/verify → dare a friend from the same rule page. This is launch-polish/core-usability work, not more beta-admin functionality.
