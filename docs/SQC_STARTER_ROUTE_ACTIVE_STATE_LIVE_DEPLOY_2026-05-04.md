# SQC starter route active state live deploy — 2026-05-04

## Change

Extended the stronger quest-state treatment from the full `/challenges` deck into the recommended starter route at the top of the page.

This keeps the first-run ladder honest and easier to scan:

- the active starter quest now gets the same clear `Active quest` callout
- active starter cards get a green highlight/glow instead of blending into the route list
- completed starter cards show a completed badge directly in the starter route
- the starter-route card uses `aria-current` when it points at the active quest

## Files changed

- `src/app/challenges/page.tsx`
- `src/app/globals.css`
- `ROADMAP.md`
- `.learnings/ERRORS.md` (logged the fresh-worktree missing-dependencies lint retry)

## Verification

Local:

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Deploy:

- Pending in this burst when written; see final smoke output for deployment URL.

Live smoke:

- Pending in this burst when written; see final smoke output for canonical checks.
