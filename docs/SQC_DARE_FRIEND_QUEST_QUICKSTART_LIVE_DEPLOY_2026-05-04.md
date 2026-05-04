# SQC dare friend-quest quickstart live deploy — 2026-05-04

## Change

Tightened the challenge-specific `/dare/[id]` invite landing page so a friend who receives a quest can understand the loop without route hunting:

- shows verifier state on the prize card;
- adds a `Friend quest quickstart` block with exact quest, verifier, reward, and proof facts;
- explains the 10-second loop: save the exact quest → play one public Lichess/Chess.com game → open the checker/receipt;
- keeps the route quest-specific instead of falling back to a generic homepage pitch.

## Files changed

- `src/app/dare/[id]/page.tsx`
- `.learnings/ERRORS.md` (logged isolated-worktree lint dependency gotcha)

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

## Deployment

- Commit: `1e73131`
- Production deploy: `https://cc-mtsx5q5n0-andreas-nordenadlers-projects.vercel.app`
- Aliased canonical domain: `https://sidequestchess.com`

## Live smoke

- Deploy `/dare/queen-never-heard-of-her` HTTP 200 and contains `Friend quest quickstart`, `Latest-game proof enabled`, `Open checker`, `Preview receipt` ✅
- Canonical `/dare/queen-never-heard-of-her` HTTP 200 with same assertions ✅
- Canonical `/account` HTTP 200 ✅
- Canonical `/result` HTTP 200 ✅
- `vercel inspect` status: Ready ✅
- Bounded `vercel logs` watch: no runtime log output/errors observed before timeout ✅
