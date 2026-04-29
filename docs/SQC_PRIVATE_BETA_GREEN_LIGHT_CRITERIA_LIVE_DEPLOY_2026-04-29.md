# SQC private beta green-light criteria — live deploy proof

Date: 2026-04-29 18:42 Europe/Stockholm  
Project: CC / Side Quest Chess  
Scope: `/beta` private/friends beta readiness surface

## Change

Added a **Private-beta green lights** section to `/beta` so Andreas has concrete criteria before inviting a wider tester circle:

- First 10 seconds: tester can explain the loop quickly.
- Account preflight: no mystery around saved username, active quest, or latest-game verification.
- Receipt clarity: passed/failed/pending each has a clear next move.
- Friend handoff: one invite plus one feedback template can recruit useful testers.

## Verification

- `pnpm install --frozen-lockfile` (clean isolated worktree dependency setup)
- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
  - Production deployment: `https://cc-iygvu1eey-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-iygvu1eey-andreas-nordenadlers-projects.vercel.app/beta` → 200 and contains `Private-beta green lights`, `Concept lands fast`, `Every result has a next move`
  - `https://sidequestchess.com/beta` → 200 and contains the same green-light strings
  - `https://sidequestchess.com/account` → 200

## Notes

Implemented from a clean `origin/main` worktree at `.worktrees/beta-copylink` to avoid the dirty shared checkout.
