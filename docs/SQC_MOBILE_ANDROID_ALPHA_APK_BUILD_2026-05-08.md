# SQC mobile Android alpha APK build — 2026-05-08

## Result
Created and linked the Expo/EAS project for the SQC mobile app, configured the Android alpha APK build profile, and produced the first installable Android build.

## Build
- Expo project: `@and72nor/side-quest-chess`
- EAS project ID: `9af73cb2-dcd5-4429-b194-67fc81206937`
- Android APK build: `6b054f4c-9e80-40c8-a03b-674433883d3b`
- Install/test link: https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/6b054f4c-9e80-40c8-a03b-674433883d3b

## Fixes made during build setup
- Added an explicit Expo entry file at `apps/mobile/index.js`; `expo/AppEntry` resolved incorrectly in the pnpm monorepo during Android bundling.
- Added `apps/mobile/eas.json` for the actual Expo app directory.
- Linked `apps/mobile/app.json` to the EAS project.
- Added `.easignore` so EAS does not upload local web build caches, worktrees, node_modules, tmp artifacts, docs, or web-only public assets.

## Verification
- `pnpm --filter @sidequestchess/mobile typecheck` passed.
- `pnpm lint` passed with existing warnings only.
- Local Android JS export passed after the entrypoint fix.
- EAS Android alpha APK build completed successfully.
