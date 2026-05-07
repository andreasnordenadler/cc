# SQC Mobile App Foundation — 2026-05-07

## Goal

Start building the Android/iOS Side Quest Chess app while preserving the launch-candidate website and the anti-drift rule: the app should follow website/backend updates wherever practical.

## What shipped in this foundation

### Web/backend API contract

Added:

- `GET /api/mobile/bootstrap`

The endpoint returns:

- API version and generation time;
- product URLs;
- mobile update-policy metadata;
- live challenge catalog generated directly from `CHALLENGES`;
- badge image URLs resolved against the current web origin.

This is the first anti-drift API: the mobile app reads the same quest catalog as the website instead of hardcoding it.

### Expo app scaffold

Added `apps/mobile/` with:

- Expo app config (`app.json`)
- mobile package manifest (`package.json`)
- TypeScript config (`tsconfig.json`)
- first React Native screen (`App.tsx`)
- API client (`src/api/sqc.ts`)
- API types (`src/types/sqc.ts`)
- mobile README (`README.md`)

The first app screen:

- fetches `/api/mobile/bootstrap`;
- renders the live quest catalog;
- shows a horizontal quest rail;
- shows selected quest detail, badge art, rules, and proof callout;
- shows the anti-drift update policy in-app.

### Workspace boundary

Updated workspace config:

- `pnpm-workspace.yaml` now includes `apps/*`.
- root `tsconfig.json` excludes `apps/mobile` so Next.js web builds do not typecheck React Native files.

## iOS vs Android

The codebase is shared. Expo can build both iOS and Android from this app.

Practical difference:

- Android is easier for early internal install/testing.
- iOS distribution requires Apple Developer/TestFlight setup later.

## Verification

- `pnpm lint` passed with known warnings only.
- `pnpm build` passed and includes `/api/mobile/bootstrap` in the route manifest.

## Next implementation steps

1. Deploy `/api/mobile/bootstrap` and smoke it on production.
2. Add authenticated mobile account API contract.
3. Add mobile auth strategy (likely Clerk-compatible mobile flow or backend-issued session bridge).
4. Add start/check/reset quest actions from the app.
5. Add proof image viewer and native share sheet.
6. Add EAS build profiles for Android/iOS.
