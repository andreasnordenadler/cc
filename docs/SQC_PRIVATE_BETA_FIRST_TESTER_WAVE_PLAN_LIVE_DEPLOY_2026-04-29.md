# SQC private beta first tester wave plan — live deploy proof

Date: 2026-04-29 19:42 Europe/Stockholm  
Project: CC / Side Quest Chess  
Scope: `/beta` private/friends beta readiness surface

## Change

Added a **First tester wave** section to `/beta` so the next invite round is concrete without becoming a premature public launch push:

- Start with **3-5 friends first**.
- Cover **both chess sites** with at least one Lichess-first and one Chess.com-first tester.
- Default most testers to the **beginner path**, with one chaos-friendly harder quest pass.
- Widen only after **two clean loops**: connect, play, verify, and report without route-hunting help.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
  - Production deployment: `https://cc-3bn0yzokj-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-3bn0yzokj-andreas-nordenadlers-projects.vercel.app/beta` → 200 and contains `First tester wave`, `3-5 friends first`, `Both chess sites`, and `Two clean loops`
  - `https://sidequestchess.com/beta` → 200 and contains the same first-wave strings
  - `https://sidequestchess.com/account` → 200
  - `https://sidequestchess.com/connect` → 200

## Notes

Implemented from clean `origin/main` worktree `.worktrees/burst-20260429-1742`. During deployment, the first Vercel command auto-linked a temporary project because the isolated worktree did not yet have the canonical `.vercel/project.json`; the canonical CC deploy was then rerun after copying `/Users/sam/.openclaw/workspace/cc/.vercel/project.json`. Future CC worktree deploys should copy the canonical Vercel project link before the first deploy command.
