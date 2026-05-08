# SQC mobile design-parity alpha — 2026-05-09

## Goal
Before Clerk Native API work, make the Android app feel like a real Side Quest Chess mobile product rather than a technical alpha shell.

## Changes
- Reworked `apps/mobile/App.tsx` into a branded SQC mobile UI.
- Added website-aligned dark/gold visual language, SQC logo treatment, and stronger hero copy.
- Improved mobile navigation chips with clearer labels/icons.
- Replaced alpha-style quest rails with polished quest cards and badge framing.
- Improved quest detail, account, status, and proof screens so they read as intentional product screens.
- Added graceful auth/sign-in pending states for the current Clerk Native API blocker.
- Kept public catalog loading independent from auth.

## Verification
- `pnpm --filter @sidequestchess/mobile typecheck` passed.
- `pnpm --filter @sidequestchess/mobile exec expo export --platform android` passed.
- `pnpm lint` passed with existing warnings only.
- EAS Android alpha APK build completed: `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/8214849b-fb48-4f85-bccd-6294535670e0`.
- Downloaded the APK, installed it on the Mac mini Android emulator with `adb install -r`, launched `com.sidequestchess.app/.MainActivity`, and confirmed:
  - process stayed alive,
  - no `FATAL EXCEPTION` in logcat,
  - screenshot showed the polished app UI and live quest content, not a loading/blank state.

## Known remaining blocker
Native Google sign-in still depends on enabling Clerk Native API in the Clerk dashboard. The app now handles this as a graceful pre-auth state instead of blocking the core catalog UI.
