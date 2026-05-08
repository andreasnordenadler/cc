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

## Emulator follow-up
After Andreas approved installing an emulator on the Mac mini, a local Android test stack was installed:

- Homebrew `android-commandlinetools`
- Homebrew `android-platform-tools`
- Homebrew `openjdk`
- Android SDK emulator/platform/system image/build-tools
- AVD: `sqc_pixel_35` using Android 15 Google APIs arm64-v8a

The new APK was downloaded from EAS, installed with `adb install`, and launched on the emulator using the explicit main activity. Result:

- Install succeeded.
- App process stayed alive after launch (`pidof com.sidequestchess.app` returned a PID).
- Foreground activity was `com.sidequestchess.app/.MainActivity`.
- No `FATAL EXCEPTION`/process crash was observed in the launch log.
- Logcat did report Clerk auth configuration: `The Native API is disabled for this instance. Visit the Clerk Dashboard to enable it.`

Conclusion: the dependency-crash fix appears valid on the emulator. Remaining mobile-auth blocker is Clerk Native API enablement for the production Clerk instance, not an APK startup crash.

## Loading-state fix follow-up
Andreas reported the APK installed but stayed on `Loading the live SQC catalog…`. Root cause: the public catalog load was gated on Clerk auth readiness. When Clerk Native API is disabled, Clerk remains noisy/unready and the public mobile shell could stay on the spinner even though the public `/api/mobile/bootstrap` endpoint works.

Fix applied:

- Public quest catalog now loads even while mobile auth is still starting or blocked.
- Account state only waits on Clerk readiness when needed.
- Mobile API fetches now have a 12-second timeout so network/API hangs surface as visible errors instead of indefinite loading.

Verification:

- `pnpm --filter @sidequestchess/mobile typecheck` passed.
- Android `expo export` passed.
- `pnpm lint` passed with existing warnings only.
- New EAS Android alpha APK build completed: `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/2c311146-efc0-4d25-990e-d86d801125d6`.
- Installed that APK on the Mac mini Android emulator and launched it with `adb`; quest catalog loaded visibly instead of staying on the spinner. Screenshot artifact: `tmp/sqc-stuckfix-screen.png` (not committed).

Remaining known issue:

- Logcat still reports Clerk: `The Native API is disabled for this instance.` Native sign-in will remain blocked until Clerk Native API is enabled in the dashboard.

## Build 3 hard split after real-device repeat loading report
Andreas reported build `2c311146-efc0-4d25-990e-d86d801125d6` still showed the same loading screen on his Android device. The startup loader was hardened again:

- Catalog bootstrap is now fully independent from account/auth loading.
- Account loading runs as a separate background effect and cannot block the public quest catalog.
- A visible build marker was added to the header: `Android alpha 0.1.2 / build 3`.
- Android version was bumped to `0.1.2`, `versionCode: 3`, so Android should install it as a clear upgrade rather than reusing a same-version APK.

Verification:

- `pnpm --filter @sidequestchess/mobile typecheck` passed.
- Android `expo export` passed.
- `pnpm lint` passed with existing warnings only.
- EAS Android alpha build completed: `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/733b2ee7-c599-4767-b97e-3664a02ed033`.
- Installed build 3 on the Mac mini emulator via `adb install -r`; launch stayed alive, no `FATAL EXCEPTION`, and screenshot confirmed both the visible build marker and loaded `LIVE CATALOG` with 11 side quests. Screenshot artifact: `tmp/sqc-build3-screen.png` (not committed).
