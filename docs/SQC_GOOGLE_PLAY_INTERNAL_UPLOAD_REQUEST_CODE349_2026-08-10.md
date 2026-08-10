# Google Play Internal testing upload request — Android code 349

Prepared: 2026-08-10  
Status: owner-approval packet; no Google Play Console state changed

## Exact approval requested

Approve uploading the verified Android App Bundle below to the **existing** Side Quest Chess Internal testing track, attaching a tester list whose sole member is `samnordbot@gmail.com`, and publishing that Internal testing release. This approval does **not** include production/open/closed-track publication, store publication, any App content, policy, legal, financial, or other declaration change, signing-key changes, developer-account or app creation, real-user data access, or external communication. If Console publication requires a declaration mutation, stop and request separate approval naming the exact declaration and confirmed values.

## Fixed app and artifact identity

- Existing Google Play app: **Side Quest Chess**
- Publisher: **Crowdler AB**
- Package: `com.sidequestchess.app`
- Candidate version: `0.1.348` (Android version code `349`)
- AAB: `apps/mobile/artifacts/android/mobile-v348-code349/side-quest-chess-android-v348-code349.aab`
- AAB size: `86,159,538` bytes
- AAB SHA-256: `c416609b1240114612f888c8a0fff205fafe0a8821ee4065cb833b395f7cbf71`
- EAS build: `dd277377-25fb-4923-a1ec-10b930c25563`
- Immutable source: `4925cd13b6a39a8be1658ac46c0bea396260dbd2`
- EAS profile/distribution: `production` / `STORE`
- Production API: `https://sidequestchess.com`
- Upload-certificate SHA-256: `89:1F:DC:5A:80:60:1E:AA:2B:6D:B1:F3:FC:B2:6A:B7:56:65:01:79:B4:0B:3A:3F:5F:58:DD:92:1D:75:3C:F2`

The inspected AAB passed bundle integrity, package/version, target SDK 36, non-debuggable release, production configuration, permission, upload-signature, dependency, source-provenance, lint, typecheck, test, production-build, generated-Android, and Gradle release-lint gates. Its responsive source passed seven Android profiles: compact, narrow, standard, tall, wide, enlarged font, and enlarged display. Carl's active Solo board regression passed rendered Goal/Picked/Latest check/Status, wrapping, clipping/overlap, buttons, navigation, keyboard, Android Back, crash, ANR, and freeze checks in every profile.

The AAB remains an upload candidate, not a Play-delivered acceptance pass. The upload certificate above is not the Google Play app-signing certificate.

## Tester and account scope

1. Attach a tester list whose exact membership is only `samnordbot@gmail.com`; stop if any other address is present.
2. Use one disposable, non-sensitive secondary Side Quest Chess account for bounded Multiplayer, reporting, and creator-block checks.
3. Use synthetic names/content labelled `Side Quest Chess internal test` and only resources created by the test accounts.
4. Give the secondary account no Play Console role, payment method, real personal data, or real-user data access.
5. Support, privacy, and moderation contact remains `sam@crowdler.com`.

## Authorized Console procedure

1. Open the existing app and fail closed unless the app name, publisher, and package exactly match the identity above. Never create another developer account, app, or package.
2. Record the current Internal testing release and tester-list state before mutation. Historical evidence from 2026-07-29 showed `0.1.340 (341)` available to internal testers but with no tester list selected; re-check rather than assuming that state is current.
3. In **App integrity**, confirm Play App Signing is enabled. Record the Play app-signing SHA-256 separately and confirm the registered upload certificate matches this candidate. Stop on mismatch; do not rotate or reset keys.
4. Recompute the local AAB SHA-256 and size. Stop unless both exactly match this packet.
5. Select **Testing → Internal testing**, create a release in the existing track, and upload only this code-349 AAB—not an APK or superseded bundle.
6. Require Google's parsed identity to show `com.sidequestchess.app`, `0.1.348`, and code `349`. Stop on any mismatch, signing error, unresolved blocking declaration, or policy error.
7. Record the tester list's full membership and require it to contain only `samnordbot@gmail.com` before attachment. Stop if any additional member is present. Record warnings verbatim; do not guess at policy, legal, account, or financial facts.
8. Review and publish only the Internal testing release. Do not promote it to another track or send tester/public communications.

## Mandatory post-publication verification

1. Open the opt-in link while signed into Google Play as `samnordbot@gmail.com`, enroll, and install/update through Google Play.
2. Verify package `com.sidequestchess.app`, version `0.1.348 (349)`, installer `com.android.vending`, and that the installed signer matches the recorded Play app-signing certificate—not the upload certificate.
3. Verify upgrade behavior from the currently installed test build without losing required test state; also verify a clean install.
4. Run the Play-delivered build through all seven acceptance profiles: compact/narrow, standard, tall, wide, enlarged font, and enlarged display. For every profile, cold-launch and preserve a screenshot plus device model, Android version, resolution, density, font scale, display scale, and app version; verify active Solo Goal/Picked/Latest check/Status readability, wrapping, clipping/overlap, board sizing, buttons/touch targets, menus, system bars, keyboard show/hide, navigation, Android Back, crashes, ANRs, freezes, and endless-loading sentinels.
5. Exercise Solo browse/detail/active, Custom, Community, Multiplayer, Settings, Help/Support, Privacy, Terms, account-deletion entry, content reporting, and creator blocking. Complete one bounded two-account Multiplayer/report/block path using only the approved non-sensitive test identities and synthetic test content.
6. Check Play Console pre-launch/device diagnostics and preserve the release identity, tester state, warnings, opt-in URL, Play-delivered signature evidence, per-profile screenshots/metadata, and interaction results.

## Pass/fail and stop boundary

Pass only when code 349 is Play-delivered to the approved tester, package/version/installer/app-signing identity match, clean-install and upgrade smoke pass, all seven Play-delivered responsive profiles and the bounded two-account path have complete evidence, and no launch-blocking defect remains. Stop without broader publication on any mismatch or severity-1/2 defect. Google Play production/store publication remains a separate explicit owner gate.
