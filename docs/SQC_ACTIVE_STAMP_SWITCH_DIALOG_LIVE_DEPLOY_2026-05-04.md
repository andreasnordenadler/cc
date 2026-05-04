# SQC active stamp + switch-dialog live deploy — 2026-05-04

## Request
Andreas reported that the `ACTIVE QUEST` stamp on quest detail pages was not visible enough and asked for a warning before `Start quest` replaces an already-active unfinished quest, ideally using the two coats of arms.

## Changes
- Reworked `public/active-quest-stamp.svg` into a higher-contrast stamp with dark backing, white `ACTIVE` text, stronger green outline, gold accent, glow, and cache-bust `v=3`.
- Enlarged/repositioned the detail-page active stamp so it reads clearly over the hero/title area.
- Added `StartQuestControls` client UI: when a signed-in user has a different unfinished active quest, `Start quest` opens a confirmation dialog instead of immediately switching.
- Dialog shows current active quest coat of arms → new quest coat of arms, with `Keep current quest` and `Switch quest` actions.
- Updated `ROADMAP.md` with Andreas’s request.

## Verification
- `pnpm lint` passed.
- `pnpm build` passed.
- Commit: `9bf4c3e` (`Improve active quest switching polish`) pushed to `origin/main`.
- Production deploy: `https://cc-hkrv2m71l-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke passed:
  - `https://sidequestchess.com/challenges/bishop-field-trip` → HTTP 200
  - `https://sidequestchess.com/challenges/knights-before-coffee` → HTTP 200
  - `https://sidequestchess.com/challenges` → HTTP 200
  - `https://sidequestchess.com/active-quest-stamp.svg` → HTTP 200
  - Live SVG contains the new white high-contrast `ACTIVE` treatment.
