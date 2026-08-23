# Side Quest Chess iOS current-candidate receipt — 2026-08-23

This receipt records local source, generated-native, Xcode, and Simulator evidence for the exact `origin/main` candidate below. It does **not** claim Apple account access, Apple development/distribution signing, provisioning, an archive/IPA, TestFlight delivery, physical-device testing, App Store Connect configuration, review submission, or public availability.

This receipt supersedes only the older release packet's local observations that full Xcode, a Simulator runtime, native compilation, and Simulator launch were unavailable. It does not supersede that packet's product, policy, account, signing, store, or real-device gates.

## Evidence source

- Git remote repository: `andreasnordenadler/cc` (Side Quest Chess product repository)
- Commit: `35edd62f159baf42f53ae023d98c78a318c768d1`
- Commit subject: `[verified] feat: foreground active quest coat (#318)`
- Isolated detached worktree: `ios-candidate-35edd62f-20260823`
- Before native generation and before writing this receipt, `HEAD` exactly matched freshly fetched `origin/main` and the tracked tree was clean.
- Package manager: Corepack pnpm `11.12.0`, matching CI; frozen-lockfile install succeeded.
- This is an observed evidence source, not an owner-approved release source freeze. The release packet's source-freeze gate remains **Not frozen**.

## Managed Expo identity

Generated from `apps/mobile/app.json`:

- Public name: **Side Quest Chess**
- Expo version: `0.1.349`
- Bundle ID candidate: `com.sidequestchess.app`
- URL scheme: `sidequestchess` (the generated app also registers the bundle-ID scheme)
- Expected callback remains `sidequestchess://sso-callback`
- Expo `usesAppleSignIn` config and Apple-authentication plugin: enabled
- Tablet support: enabled
- Runtime UI policy: dark; portrait and portrait-upside-down declarations on iPhone; those orientations plus both landscapes on iPad

## Source gates on the exact commit

All commands used pnpm `11.12.0` with `CI=true` where applicable.

| Gate | Result |
| --- | --- |
| Frozen install | Passed; 1,027 packages reused, lockfile unchanged |
| Repository tests | Passed: 803 tests, 0 failed, 0 skipped, 0 todo |
| ESLint | Passed with 0 errors and 4 pre-existing warnings |
| Mobile TypeScript | Passed |
| Expo Doctor | Passed all 18/18 checks |
| Expo iOS prebuild | Passed; no tracked managed files changed |

The generated `apps/mobile/ios` tree was inspected and then removed. It is not proposed for commit.

## Generated native identity

- Project: `SideQuestChess.xcodeproj`
- Workspace after CocoaPods: `SideQuestChess.xcworkspace`
- Scheme/target: `SideQuestChess`
- Configurations: Debug and Release
- Generated deployment target: iOS `15.1`
- Product bundle ID: `com.sidequestchess.app`
- Generated product families: iPhone and iPad (`1,2`)
- Generated Apple entitlement: `com.apple.developer.applesignin = Default`
- Generated ATS: arbitrary loads disabled; local networking enabled
- Generated usage descriptions: none, consistent with the current dependency/config surface
- Generated URL schemes: `sidequestchess`, `com.sidequestchess.app`
- Generated privacy manifest: tracking `false`; no collected-data declarations in the binary manifest; required-reason API entries for file timestamp, user defaults, disk space, and system boot time

CocoaPods `1.17.0` installed 84 pods from 85 declared dependencies and produced the workspace. CocoaPods emitted only dependency-script/deprecation notices.

## Xcode and artifact evidence

Host/tooling:

- macOS `26.5.2` (`25F84`)
- Selected developer directory: `/Applications/Xcode.app/Contents/Developer`
- Xcode `26.6` (`17F113`)
- iOS Simulator runtime: iOS `26.5` (`23F77`)
- Local Apple code-signing identities: **0 valid identities**

Exact build command shape:

```text
xcodebuild -workspace apps/mobile/ios/SideQuestChess.xcworkspace \
  -scheme SideQuestChess \
  -configuration Release \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=25423278-D058-4FD7-95FE-7BA695DA23CE' \
  -derivedDataPath /tmp/sqc-ios-35edd62f-derived \
  CODE_SIGNING_ALLOWED=NO build
```

Result: `** BUILD SUCCEEDED **`.

Inspected Release Simulator `.app`:

- Bundle identifier: `com.sidequestchess.app`
- Display name: `Side Quest Chess`
- Short version: `0.1.349`
- Build: `1`
- Minimum OS: `15.1`
- Device families: iPhone and iPad
- Embedded `main.jsbundle`: present, 3,724,254 bytes
- App size: approximately 97 MB
- Xcode's normal `Validate` build task ran with `-validate-for-store` for the Simulator product; this is not App Store upload/archive validation

This Simulator `.app` is ad-hoc/linker-signed only: it has no Apple Team ID, distribution signature, provisioning profile, or distribution entitlements. It is not a device archive or an App Store IPA.

## Simulator launch evidence

The same Release Simulator `.app` was installed and launched on two materially different current-runtime destinations:

| Destination | UDID | Runtime | Result |
| --- | --- | --- | --- |
| iPhone 17e | `25423278-D058-4FD7-95FE-7BA695DA23CE` | iOS 26.5 | Installed and launched as PID 8652; settled 1170×2532 capture showed the Side Quest Chess sign-in/browse screen |
| iPad Pro 13-inch (M5) | `02189F8B-B2ED-49AF-83B5-E630C8059EB1` | iOS 26.5 | Installed and launched as PID 8984; settled 2064×2752 capture showed the Side Quest Chess sign-in/browse screen |

Contemporaneous OCR of both settled captures found the full public name **Side Quest Chess**, “Sign in to continue”, the Solo and Multiplayer browse actions, and the sign-in method heading. Sanitized signed-out captures are retained in this branch:

- `docs/evidence/ios-35edd62f/iphone17e-sign-in.jpg` — SHA-256 `49aee2bb496b31e75475b3784815dad45032945f34f05033225b5eb226365437`
- `docs/evidence/ios-35edd62f/ipad-pro13-sign-in.jpg` — SHA-256 `104433b0f1333a344ecf761bc09d7de71dbc7c60090d7a9b25dcc85cdb36c32d`

A contemporaneous `sidequestchess://sso-callback` open-URL probe was accepted by both Simulator destinations with zero exit status. This proves registered scheme routing only; it does not prove a successful provider-authentication callback.

Both `simctl launch` commands returned a live PID and the settled captures rendered the app rather than a crash surface. No comprehensive log inspection or runtime journey was performed for this refresh; the prior generated React Native `UIScene` future-SDK notice remains a tracked compatibility risk.

The two bounded test simulators were shut down after capture.

## Fail-closed remaining gates

The candidate is **not launch-ready**. The following is a non-exhaustive current list. Every unresolved gate and decision in `docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md` remains blocking unless a later exact-candidate receipt explicitly closes it:

1. Crowdler AB Apple Developer Program legal publisher/account status.
2. Dedicated Crowdler operational Apple identity and least-privilege Apple Developer/App Store Connect permissions.
3. Bundle-ID availability/ownership and duplicate reconciliation in the live Apple portals.
4. Distribution certificate/profile and managed signing under Crowdler AB.
5. Signed archive and IPA inspection, including final entitlements, provisioning, privacy manifests, export-compliance answer, version/build, and SDK identity.
6. End-to-end Sign in with Apple and `sidequestchess://sso-callback` on the exact signed candidate.
7. Sign in with Apple authorization revocation as part of account deletion; current source deletes first-party/Clerk data but does not yet prove provider-token revocation.
8. Privacy nutrition-label answers reconciled against Clerk and every shipped SDK/provider behavior.
9. Fresh App Store screenshot set on Apple's required current device sizes and states; these Simulator QA captures are not listing assets.
10. TestFlight upload, tester access, store-delivered install, and signed-in smoke on a real iPhone.
11. App Store Connect metadata/privacy/review configuration and review notes read-back.
12. Review submission, approval, and public availability as separate verified states.
13. Android and web public launch/readback, which must precede iOS App Review submission and public release under the standing launch order.
14. Complete UGC moderation workflow, abusive-user blocking, reporting, and App Review explanation for community content.
15. Production support/privacy/terms route readback on the final deployment, plus content-rights, age-rating, territory, compatibility-availability, and legal/export-compliance decisions.

No Apple account, credential, signing, App Store Connect, TestFlight, submission, payment, legal, or release mutation was attempted.
