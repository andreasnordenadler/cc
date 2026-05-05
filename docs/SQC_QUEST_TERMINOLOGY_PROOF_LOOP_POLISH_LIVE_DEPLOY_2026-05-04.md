# SQC quest terminology proof-loop polish — live deploy

Date: 2026-05-04 05:50 Europe/Stockholm

## Change

Tightened two remaining visible proof-loop wording leaks from the older dare/challenge framing:

- Homepage proof-loop section now says `Pick one quest` / `1. Pick the quest` instead of `Set the dare` / `Pick the dare`.
- Proof log receipt-state copy now says `quest back` instead of `dare back`.

This keeps the first-run loop aligned with the current product canon: Side Quest Chess uses `quest` language in visible UI.

## Files changed

- `src/app/page.tsx`
- `src/app/proof-log/page.tsx`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-3i1s9e49n-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-3i1s9e49n-andreas-nordenadlers-projects.vercel.app/` → 200
  - `https://sidequestchess.com/` → 200
  - `https://sidequestchess.com/proof-log` → 200
  - `https://sidequestchess.com/account` → 200
- Live content assertions ✅
  - Homepage contains `Pick one quest, play a real public game`
  - Homepage contains `1. Pick the quest`
  - Proof log contains `Copy, share, or quest back`
- Vercel inspect ✅
  - Deployment status: `Ready`
  - Aliases include `https://sidequestchess.com` and `https://www.sidequestchess.com`

## Notes

A bounded Vercel runtime-log watch emitted no captured runtime log output before termination; no 500/runtime errors were observed during smoke checks.
