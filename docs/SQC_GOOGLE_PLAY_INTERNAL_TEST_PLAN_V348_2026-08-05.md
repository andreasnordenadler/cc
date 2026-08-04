# Google Play Internal testing plan — Android code 348

Prepared: 2026-08-05
Status: paste-ready operating checklist; no Console state changed

## Fixed app and candidate identity

- Existing Play Console app: **Side Quest Chess** (`com.sidequestchess.app`), published by Crowdler AB. Never create another developer account, app, package, or listing.
- Candidate: `0.1.347` / Android version code `348`.
- AAB: `apps/mobile/artifacts/android/mobile-v347-code348/side-quest-chess-android-v347-code348.aab`.
- AAB SHA-256: `c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576`.
- EAS build: `c8290195-f35b-48b5-961d-907b7adb532b`.
- Immutable source: `5ece97b95de996b630775359e312a001e58ff59c`.
- EAS profile/distribution: `production` / `STORE`.
- Production API endpoint: `https://sidequestchess.com`.
- Upload certificate SHA-256: `89:1F:DC:5A:80:60:1E:AA:2B:6D:B1:F3:FC:B2:6A:B7:56:65:01:79:B4:0B:3A:3F:5F:58:DD:92:1D:75:3C:F2`.

The AAB has already passed bundle integrity, manifest, package/version, non-debuggable, production-configuration, permission, upload-signature, and source-provenance inspection. AAB alone is not a Play-delivered acceptance pass.

## Tester and account plan

- Primary tester: `samnordbot@gmail.com`.
- Support, privacy, and moderation contact: `sam@crowdler.com`.
- Use one disposable, non-sensitive secondary Side Quest Chess account for bounded two-account Multiplayer, content-reporting, and creator-block checks.
- Use synthetic display names and content labelled `Side Quest Chess internal test`.
- Give the secondary account no Play Console role, payment method, real personal data, or access to real-user records.
- Access only test resources created by these accounts. Do not inspect, modify, or export real-user data.
- Link a disposable public chess profile only if a proof flow requires it; record the public username only and no authentication material.
- Keep the primary tester enrolled for regression installs. Removing a tester or deleting an identity is a separate authorized action.

## Play App Signing and App integrity prerequisites

Complete these checks in the existing app before any upload or rollout:

1. Open **Side Quest Chess** with package `com.sidequestchess.app`; stop if the package, publisher, or app identity differs.
2. Open the app's **App integrity** area and confirm Play App Signing is enabled.
3. Record the app signing key certificate SHA-256 separately from the upload certificate shown above. Never treat the two certificates as interchangeable.
4. Confirm the registered upload certificate matches the candidate's upload certificate. Stop on a mismatch; do not rotate or reset signing keys in this lane.
5. Confirm Internal testing is available for this existing app and note its current release state before making changes.
6. Confirm required App content and policy declarations are complete enough for Internal testing. Unresolved declaration, legal-adoption, account, or moderation facts stay blocked rather than being guessed.
7. Confirm the Console account can manage the existing Internal testing tester list without granting broader production or financial access.

Play App Signing confirmation is a Console fact and remains unverified until an authorized owner records it. After Play delivery, the installed certificate must match the app signing certificate, not the upload certificate.

## Owner-gated Console procedure

Google Play upload, tester-list mutation, Internal testing rollout, declaration submission, and publication require explicit owner approval.

After that approval:

1. Recompute the local AAB SHA-256 and require the exact value in **Fixed app and candidate identity**.
2. In the existing app, select **Testing → Internal testing**. Do not create a new app, package, or developer account.
3. Confirm or create the bounded tester list containing only the approved addresses, beginning with `samnordbot@gmail.com`.
4. Create a new Internal testing release and upload only the exact code-348 AAB. Do not upload an APK or a superseded bundle. In particular, do not upload the superseded `0.1.346 (347)` candidate.
5. Require Play's parsed identity to show package `com.sidequestchess.app`, version name `0.1.347`, and version code `348`. Stop on any mismatch or signing warning.
6. Review device-catalog, target-API, integrity, declaration, and policy warnings. Record each warning verbatim and resolve it from confirmed facts; do not guess.
7. Attach the approved tester list and confirm the support contact is `sam@crowdler.com`.
8. Review the release summary and stop before rollout unless the explicit approval includes Internal testing publication.
9. Following an authorized rollout, open the opt-in link while signed into Google Play as `samnordbot@gmail.com`, opt in, and install or update through Google Play.
10. Confirm the installer package is `com.android.vending`, installed version is `0.1.347 (348)`, and the installed signer matches the recorded Play app signing certificate.

## Play-delivered acceptance matrix

Use the Play-delivered install, not an APK sideload, and save screenshots for every profile. Cover at minimum:

| Profile | Required state |
| --- | --- |
| Compact/narrow phone | compact/narrow viewport at default scales |
| Standard phone | standard viewport at default scales |
| Tall phone | tall viewport at default scales |
| Wide phone | wide viewport at default scales |
| Enlarged text | standard phone with enlarged font scale |
| Enlarged display | standard phone with enlarged display scale |

For each profile:

1. Launch from a cold stop and verify no crash, ANR, freeze, or endless loading state.
2. Sign in and out using only approved test identities.
3. Open Solo browse, a Solo detail, and an active Solo Side Quest. The Goal, Picked, Latest check, and Status content must have usable width and reading order.
4. Check wrapping, clipping, overlap, board sizing, touch targets, buttons, bottom navigation, menus, and system bars.
5. Exercise keyboard show/hide and confirm focused fields and actions remain visible.
6. Exercise in-app navigation and Android Back from every visited top-level and detail screen; confirm no trap, unexpected exit, or lost required state.
7. Exercise Custom, Community, Multiplayer, Settings, Help/Support, Privacy, Terms, account-deletion entry, content report, and creator block.
8. Complete one bounded two-account Multiplayer/report/block path using only synthetic non-sensitive content.
9. Capture screenshots of the active Solo regression state and every failure; record device model, Android version, resolution, density, font scale, display scale, and app version.
10. Review device and Play Console diagnostics for crashes, ANRs, and freezes after the matrix.

## Pass/fail boundary

Pass only when:

- Play delivered code 348 through Internal testing;
- package, version, installer, and Play app-signing certificate all match the recorded Console facts;
- every responsive profile has complete screenshots and checks;
- no severity-1/2 defect, unusably narrow active-Solo column, clipping, overlap, blocked button, navigation failure, keyboard obstruction, Android Back failure, crash, ANR, or freeze remains.

Until then, the bundle is a provenance-verified Internal testing upload candidate, not a Play-delivered or store-publication acceptance pass.
