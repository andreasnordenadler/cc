# SQC Mobile Emulator Screenshot Workflow — 2026-05-14

## Purpose

Andreas wants mobile UI review through screenshot sets instead of installing every APK. The local Android emulator is now the default proof surface for UI-heavy SQC mobile slices.

## Installed / verified

- Android SDK command-line tools are available under `/opt/homebrew/share/android-commandlinetools`.
- AVD exists: `sqc_pixel_35` (`Pixel 6`, Android 15 / API 35, arm64 Google APIs).
- Installed JDK 17 via Homebrew because Gradle failed under JDK 25 with `Unsupported class file major version 69`.
- Verified `adb` screenshot capture from emulator.
- Built a local debug APK from Expo prebuild output and installed it on the emulator.
- Launched `com.sidequestchess.app/.MainActivity` with Metro running.

## Important local env

Use these exports for Android emulator/build commands:

```bash
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$JAVA_HOME/bin:$PATH"
```

## Current screenshot proof

Captured on 2026-05-14 from `sqc_pixel_35`:

- `tmp/sqc-mobile-screenshots/2026-05-14-emulator-setup/11-side-quests-tab.png`
- `tmp/sqc-mobile-screenshots/2026-05-14-emulator-setup/12-mission-tab.png`
- `tmp/sqc-mobile-screenshots/2026-05-14-emulator-setup/13-coats-tab.png`
- `tmp/sqc-mobile-screenshots/2026-05-14-emulator-setup/14-my-sqc-tab.png`

## Observed UI issues from first emulator screenshot pass

- The rightmost bottom tab is clipped/off-screen in the current layout.
- The hero description truncates awkwardly (`come b…`) on the emulator width.
- These are now good candidates for the next UI polish pass before adding much more functionality.

## Notes

- `apps/mobile/android/` and `apps/mobile/.expo/` are local generated artifacts from Expo prebuild/Metro and should not be committed while the mobile app remains managed Expo.
- For future UI slices, capture screenshots first, then send Andreas the screenshot set with a short UI readout and concrete proposed fixes.
