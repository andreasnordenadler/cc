# SQC Mobile safe-area context fix — 2026-05-09

## Trigger

Andreas tested the prior Android safe-area fix and reported: “Not working”. The screenshot still showed content too close to / under the Android system status area.

## Root cause

The prior fix used manual Android offsets with React Native `SafeAreaView`. That is not reliable enough for the actual Android device/window-inset behavior.

## Shipped

- Added Expo-compatible `react-native-safe-area-context`.
- Wrapped the app in `SafeAreaProvider`.
- Switched the root mobile screen to `SafeAreaView` from `react-native-safe-area-context` with top/bottom/left/right edges.
- Kept StatusBar non-translucent with SQC dark background.
- Added Expo native config for Android status/nav bars:
  - `androidStatusBar.backgroundColor: #060507`
  - `androidStatusBar.barStyle: light-content`
  - `androidStatusBar.translucent: false`
  - `androidNavigationBar.backgroundColor: #060507`
  - `androidNavigationBar.barStyle: light-content`
- Bumped visible/runtime mobile identifiers:
  - `MOBILE_BUILD_LABEL`: `Android preview 0.2.14 / safe-area fix`
  - mobile package: `0.1.10`
  - Expo version: `0.1.12`
  - Android `versionCode`: `13`

## Verification

- `pnpm --dir apps/mobile typecheck` ✅
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-safe-area-context` ✅
- `pnpm lint` ✅ with 3 known pre-existing warnings.

## APK status

A fresh APK is required for Andreas to see this native safe-area fix. EAS CLI currently reports `Not logged in`, so the source fix is ready and verified, but APK production is blocked on Expo/EAS authentication.
