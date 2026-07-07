# SQC Mobile Store Launch Prep - 2026-07-07

## Current Readiness

Side Quest Chess Mobile has meaningful launch prep already done, especially for Android beta/release-candidate distribution.

Ready or partly ready:

- App identity exists:
  - Name: `Side Quest Chess`
  - Android package: `com.sidequestchess.app`
  - iOS bundle ID: `com.sidequestchess.app`
  - Current version: `0.1.336`
  - Current Android version code: `336`
- Production API target is configured: `https://sidequestchess.com`.
- Android release signing is configured through `apps/mobile/credentials.json` / `apps/mobile/credentials/android/keystore.jks`.
- Android release candidates have been built and GitHub-released repeatedly.
- Current Android candidate `mobile-v336` passes `pnpm mobile:release:candidate-check`:
  - APK asset: `sqc-mobile-android-v336-2026-07-03.apk`
  - SHA256: `d4367b8aa64fb67726a26d2b8129eee4e04ee351a42c64a3e42a0052bc80a4f0`
  - Manifest identity matches app config.
  - `debuggable=false`.
  - `allowBackup=false`.
  - Signer is not the Android debug identity.
- Google Play AAB generation is now proven locally:
  - Command: `pnpm mobile:store:android`
  - Underlying Gradle task: `:app:bundleRelease`
  - Verified output path: `artifacts/mobile-store/sqc-mobile-android-v336-2026-07-07.aab`
  - SHA256: `f29985c6f6944cb1da927c879c2266facd8953d0904507ca78888c59311321da`
- Public web legal/support pages exist:
  - `/privacy`
  - `/terms`
  - `/help-support`
  - `/support`
- Real-device smoke checklist exists at `apps/mobile/REAL_DEVICE_SMOKE.md`.

## Gaps Before Store Submission

Android / Google Play:

- Confirm or create Google Play Console app under Andreas's developer account.
- Upload the AAB to an internal testing track.
- Complete Play Console forms:
  - App access
  - Ads declaration
  - Content rating
  - Target audience and content
  - Data safety
  - Privacy policy URL
  - App category
  - Contact details
- Prepare required listing assets:
  - Short description
  - Full description
  - Feature graphic
  - Phone screenshots
  - Optional tablet screenshots
  - App icon review
- Run Play-internal-test install on a real Android device, not only GitHub APK install.

iOS / Apple App Store:

- No local `apps/mobile/ios` native project exists in the repo right now; iOS is expected to be built through Expo/EAS or generated via prebuild.
- EAS config exists, but `eas` CLI was not available in the current shell during this audit.
- Confirm Apple Developer Program account access and App Store Connect app record.
- Generate or confirm iOS signing credentials and provisioning profiles.
- Produce first TestFlight build.
- Verify OAuth/deep-link callback behavior on iOS:
  - Scheme: `sidequestchess`
  - Expected callback route: `sidequestchess://sso-callback`
- Complete App Store privacy nutrition labels, age rating, support URL, marketing URL, and review notes.
- Run TestFlight install and signed-in smoke on a real iPhone.

Shared launch gates:

- Decide launch candidate freeze point after the web/app alignment question is settled.
- Confirm support/deletion flow text is sufficient for app-store review.
- Capture fresh store screenshots from the current candidate, not older web-parity screenshots.
- Create store listing copy and review notes.
- Run authenticated smoke against production backend immediately before submission.

## Recommended Next Order

1. Finish the current SQC website rebuild decision separately; do not let website work block mobile internal testing unless it changes backend/auth contracts.
2. Cut a fresh mobile candidate if any app changes are needed after `mobile-v336`.
3. Run `pnpm mobile:release:candidate-check`.
4. Run `pnpm mobile:store:android`.
5. Upload the generated AAB to Google Play internal testing.
6. Install from Play internal testing and complete `apps/mobile/REAL_DEVICE_SMOKE.md`.
7. Install EAS CLI or use the Expo dashboard to create an iOS TestFlight build.
8. Complete store listing/privacy forms and submit to review.
