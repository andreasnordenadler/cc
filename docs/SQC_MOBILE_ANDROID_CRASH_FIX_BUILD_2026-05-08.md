# SQC mobile Android crash fix build — 2026-05-08

## Trigger
Andreas reported that the first Android alpha APK crashed on device.

## Local reproduction / diagnosis
The Mac mini does not currently have Android SDK `adb` or an Android emulator installed, so direct on-device/emulator reproduction was not possible locally.

Instead, local Expo validation found a likely crash cause:

- `expo-doctor` failed because native Expo packages were mismatched for Expo SDK 54.
- `expo-auth-session`, `expo-secure-store`, and `expo-web-browser` were on incompatible major versions.
- Required native peer dependencies `react-dom` and `expo-font` were also missing.

## Fix
Aligned mobile dependencies with Expo SDK 54 expectations and added missing native peers:

- `expo-auth-session` -> `7.0.11`
- `expo-secure-store` -> `^15.0.8`
- `expo-web-browser` -> `^15.0.11`
- `react` / `react-dom` -> `19.1.0`
- `react-native` -> `^0.81.5`
- `@types/react` -> `^19.1.17`
- added `expo-font`

## Verification
- `pnpm --filter @sidequestchess/mobile typecheck` passed.
- `expo-doctor` passed all 17 checks.
- local Android JS export passed.
- `pnpm lint` passed with existing warnings only.
- New EAS Android alpha APK build completed successfully.

## New build
https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/d84b42fa-8893-4fc4-8f7a-8e6717f745aa
