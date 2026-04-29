# SQC private beta live deck checklist deploy — 2026-04-29

## Scope

Added a dedicated **Live beta deck** section to `/beta` so friends/private beta testers can see, in one place, that all ten current starter-deck quests are dual-host ready for Lichess + Chess.com latest-game checking.

## User-visible change

- `/beta` now includes a full current deck checklist.
- Each quest card shows category, difficulty, title, objective, and a direct rules link.
- The copy explicitly says every listed quest can be made active, played on either supported chess site, and checked from latest public games without a pasted PGN or game URL.

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed.
- Production deploy — passed via Vercel deployment `https://cc-8n24maczs-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`.
- Live smoke — passed for preview `/beta`, canonical `/beta`, and canonical `/verifiers`.

## Live smoke details

- `https://cc-8n24maczs-andreas-nordenadlers-projects.vercel.app/beta` returned HTML containing `Live beta deck`, `All 10 starter-deck quests`, `without a pasted PGN or game URL`, `The Blunder Gambit`, and `Knightmare Mode`.
- `https://sidequestchess.com/beta` returned the same checklist strings.
- `https://sidequestchess.com/verifiers` still returned `The Blunder Gambit` and `Knightmare Mode`, confirming the broader dual-host verifier surface remained live after deployment.

## Deployment note

An initial Vercel deploy from the isolated worktree auto-created a throwaway `autoburst-20260429-0942` project because the worktree `.vercel/project.json` was not the canonical `cc` project file. I corrected the project link by copying `/Users/sam/.openclaw/workspace/cc/.vercel/project.json` into the worktree and redeployed to the canonical `cc` project before claiming live progress.
