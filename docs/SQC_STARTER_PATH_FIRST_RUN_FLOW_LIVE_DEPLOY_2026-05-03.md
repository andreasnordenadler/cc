# SQC Starter Path First-Run Flow — Live Deploy Proof

Date: 2026-05-03 10:58 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

Made the already-built `/path` starter ladder visible in the first-run flow:

- Added `Starter path` to the primary navigation between `Quests` and `Today`.
- Changed the homepage primary CTA from the full quest hub to `/path` (`Start starter path`).
- Kept `Browse quests` and `Connect account` available as secondary choices.
- Changed the homepage recommended panel to point explicitly at the starter path while still showing the three first-run quest badges.

## Why

After the terminology cleanup, the next visible onboarding improvement was reducing first-click ambiguity. New players now have one obvious beginner route before they face the full chaos deck.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
- Live smoke checks ✅
  - `https://cc-bh6tush77-andreas-nordenadlers-projects.vercel.app/` returned 200 and contains `Start starter path` + `Starter path`.
  - `https://cc-bh6tush77-andreas-nordenadlers-projects.vercel.app/path` returned 200 and contains `Three bad ideas, in survivable order`.
  - `https://sidequestchess.com/` returned 200 and contains `Start starter path` + `Starter path`.
  - `https://sidequestchess.com/path` returned 200 and contains `Three bad ideas, in survivable order`.
- Vercel production error-log scan ✅: `No logs found for andreas-nordenadlers-projects/cc`.

## Deployment

- Commit: `8b2d205` (`Put SQC starter path in the first-run flow`)
- Deploy URL: `https://cc-bh6tush77-andreas-nordenadlers-projects.vercel.app`
- Canonical: `https://sidequestchess.com`
