# SQC result beta report shortcut live deploy — 2026-04-30

## Change

Added a `Beta report shortcut` block to `/result` so private-beta testers can copy the receipt facts immediately after a latest-game check.

The shortcut includes:

- challenge title
- receipt status
- latest-check headline and detail
- game/source identifier
- recommended next action
- fairness note prompt

## Why

The receipt screen already explained passed/failed/pending next steps, but a tester still had to reconstruct the useful beta report manually. This makes the post-result loop less fuzzy and captures the exact confusion/fairness signal while the moment is fresh.

## Files changed

- `src/app/result/page.tsx`
- `ROADMAP.md`
- `.learnings/ERRORS.md`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Canonical Vercel project: `cc`
  - Deployment URL: `https://cc-1iahtqys6-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-1iahtqys6-andreas-nordenadlers-projects.vercel.app/result` → 200
  - `https://sidequestchess.com/result` → 200
  - `https://sidequestchess.com/beta` → 200
  - `https://sidequestchess.com/account` → 200
  - `/result` contains `Beta report shortcut`, `Copy the receipt facts before the moment gets fuzzy`, and `Fairness note: Did this receipt make the next move obvious`
- Bounded Vercel log stream ✅
  - Resolved deployment `dpl_5iuPcyUd1jTuEnKGkpPZLihha5Z2`
  - No runtime error lines emitted during the short post-deploy watch window

## Deployment note

A first deploy from the isolated worktree auto-linked a throwaway Vercel project named `autoburst-20260430-0342`. I corrected it before claiming production by copying the canonical `.vercel/project.json` from the main `cc` checkout and redeploying to the real `cc` project, which re-aliased `https://sidequestchess.com`.
