# SQC Dare Proof Path Handoff — Live Deploy Proof

Date: 2026-05-03 18:44 Europe/Stockholm  
Owner: Sam

## What changed

Added a proof-path card to every `/dare/[id]` friend-quest page so a recipient understands the full loop before leaving the invite page:

1. accept/save the exact quest;
2. play one eligible public game on Lichess or Chess.com;
3. return to Side Quest Chess for the latest-game receipt.

This keeps friend invites from feeling like a static marketing page and turns them into a clearer launch loop.

## Files changed

- `src/app/dare/[id]/page.tsx`
- `ROADMAP.md`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-2079vxllu-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Vercel inspect ✅
  - Status: `Ready`
  - Aliases include `https://sidequestchess.com` and `https://www.sidequestchess.com`
- Live smoke ✅
  - `https://cc-2079vxllu-andreas-nordenadlers-projects.vercel.app/dare/knights-before-coffee` → 200
  - `https://sidequestchess.com/dare/knights-before-coffee` → 200
  - `https://sidequestchess.com/account` → 200
  - `https://sidequestchess.com/result` → 200
- Content assertions ✅
  - `/dare/knights-before-coffee` contains `Proof path`
  - `/dare/knights-before-coffee` contains `Play normally, then let SQC check the mess`
  - `/dare/knights-before-coffee` contains `No PGN upload or password sharing`
  - `/dare/knights-before-coffee` contains `Save and check quest`
  - `/dare/knights-before-coffee` contains `Open receipt`
- Vercel production error logs ✅
  - `vercel logs --environment production --level error --since 10m --no-follow --no-branch -n 20`
  - Result: no logs found

## User-visible effect

A friend who opens a quest invite now sees exactly how to prove the side quest without PGN upload homework or password sharing, plus direct handoffs to account checking and the receipt page.
