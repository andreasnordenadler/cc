# SQC challenge hub beta starter route live deploy — 2026-04-30

## Change

Added a "Private beta starter route" section to `/challenges` so a first-time tester has a recommended order instead of facing the full deck cold:

1. `Knights Before Coffee` — smallest-rule survivable proof loop.
2. `No Castle Club` — clean verifier sanity check.
3. `Queen? Never Heard of Her` — cursed shareable chaos stretch.

This is part of private/friends beta hardening: reduce choice paralysis, keep the proof loop obvious, and steer testers toward useful receipt feedback.

## Verification

- `pnpm install --frozen-lockfile` in isolated worktree `.worktrees/beta-clarity-0430`.
- `pnpm lint` passed.
- `pnpm build` passed locally.
- Production deploy passed with `npx vercel --prod --yes`.
- Vercel deployment: `https://cc-eonmgfoi4-andreas-nordenadlers-projects.vercel.app`.
- Aliased production domain: `https://sidequestchess.com`.
- Live smoke passed:
  - `https://cc-eonmgfoi4-andreas-nordenadlers-projects.vercel.app/challenges` → 200
  - `https://sidequestchess.com/challenges` → 200
  - `https://sidequestchess.com/beta` → 200
  - `https://sidequestchess.com/account` → 200
- Live content assertions passed on `/challenges`:
  - `Private beta starter route`
  - `Three picks that remove choice paralysis`
  - `Knights Before Coffee`
  - `No Castle Club`
  - `Queen? Never Heard of Her`
- Bounded Vercel deployment log stream showed no new error/500 output during the watch window.

## User-visible impact

The challenge hub now directly answers “which quest should I try first?” with a three-step beta route: first weird win, clean verifier read, chaos stretch.
