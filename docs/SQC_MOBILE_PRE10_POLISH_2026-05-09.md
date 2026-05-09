# SQC mobile pre-10:00 polish pass — 2026-05-09

## Scope

Final bounded mobile polish pass before the 10:00 Clerk/auth window.

## Shipped

- Pulled latest `origin/main` first; repository was already up to date.
- Kept the pass intentionally small and safe: Android pull-to-refresh now refreshes both the live quest catalog and the account mirror instead of only refreshing the catalog.
- Bumped visible/runtime mobile identifiers:
  - `MOBILE_BUILD_LABEL`: `Android preview 0.2.12 / pre-10 polish`
  - mobile package: `0.1.8`
  - Expo version: `0.1.10`
  - Android `versionCode`: `11`

## Verification

- `pnpm --dir apps/mobile typecheck` ✅
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-pre10-polish` ✅
- `pnpm lint` ✅ with 3 pre-existing warnings:
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - `src/components/proof-image.tsx` `<img>` warning
  - `src/components/site-nav.tsx` `<img>` warning

## APK / emulator status

- Fresh EAS Android alpha APK was not produced in this run because Expo/EAS auth is unavailable in the shell:
  - no `EXPO_TOKEN`/`EAS_TOKEN` was present
  - `pnpm --dir apps/mobile dlx eas-cli whoami` returned `Not logged in`
- Local emulator smoke was not practical for this source state because no fresh APK could be produced and no running `adb` device was attached.
- Android JS export succeeded, so the current mobile bundle compiles for Android.

## Notes for the next APK build

When Expo auth is available, build the next tester APK from this commit with:

```bash
pnpm --dir apps/mobile dlx eas-cli build --platform android --profile android-alpha --non-interactive
```

Do not commit or print Expo/EAS tokens.
