# Side Quest Chess iOS current-candidate receipt — 2026-08-24

This receipt records local source, generated-native, Xcode, and Simulator evidence for the exact `origin/main` candidate below. It does **not** claim Apple account access, Apple development/distribution signing, provisioning, an archive/IPA, TestFlight delivery, physical-device testing, App Store Connect configuration, review submission, or public availability.

This receipt supersedes only the older release packet's local observations that Simulator registration, native compilation, and Simulator launch were blocked. It does not supersede that packet's product, policy, account, signing, store, or real-device gates.

## Evidence source

- Commit: `283ad0f0821a125376004ec1599f1fe01a54c302`
- Commit subject: `[verified] fix: enforce Coat of Arms copy (#319)`
- Isolated worktree: `ios-current-candidate-20260823-v11`
- Before native generation, `HEAD` exactly matched freshly fetched `origin/main`; the tracked tree was clean.
- Package manager: Corepack pnpm `11.12.0`, matching CI.
- Lockfile SHA-256: `5edd63864c5af4d5a85718e5af02bc769ae7634d8b8b60349a4f08c03d3317e9`.
- This is an observed evidence source, not an owner-approved release source freeze.

## Source gates on the exact commit

| Gate | Result |
| --- | --- |
| Frozen install | Passed; lockfile unchanged |
| Repository tests | Passed: 804 tests, 0 failed, 0 skipped, 0 todo |
| ESLint | Passed with 0 errors and 4 pre-existing warnings |
| Mobile TypeScript | Passed |
| Expo Doctor | Passed all 18/18 checks |
| Expo iOS prebuild | Passed; generated only the untracked `apps/mobile/ios/` tree |

The generated native tree was inspected and removed. It is not proposed as source.

## Generated native identity

- Project/workspace/scheme: `SideQuestChess.xcodeproj`, `SideQuestChess.xcworkspace`, `SideQuestChess`
- Configurations: Debug and Release
- Display name: **Side Quest Chess**
- Version/build: `0.1.349` / `1` (provisional; not reconciled with App Store Connect)
- Bundle ID: `com.sidequestchess.app`
- Deployment target: iOS `15.1`
- Product families: iPhone and iPad (`1,2`); iPad multitasking remains enabled
- URL schemes: `sidequestchess`, `com.sidequestchess.app`
- Expected callback: `sidequestchess://sso-callback`
- Apple entitlement: `com.apple.developer.applesignin = Default`
- ATS: arbitrary loads disabled; local networking enabled
- Sensitive-resource usage descriptions: none generated
- Aggregate privacy manifest: tracking `false`, no native collected-data declarations, and required-reason entries for file timestamps (`C617.1`, `0A2A.1`, `3B52.1`), user defaults (`CA92.1`), disk space (`E174.1`, `85F4.1`), and system boot time (`35F9.1`)
- CocoaPods `1.17.0`: 85 dependencies, 84 pods installed

These are generated-source observations, not a final privacy-label or exact-IPA receipt.

## Xcode build evidence

Host/tooling:

- macOS `26.5.2` (`25F84`)
- Developer directory: `/Applications/Xcode.app/Contents/Developer`
- Xcode `26.6` (`17F113`)
- iOS Simulator runtime: iOS `26.5` (`23F77`)
- Local Apple code-signing identities: **0 valid identities**

Exact build:

```text
xcodebuild -workspace apps/mobile/ios/SideQuestChess.xcworkspace \
  -scheme SideQuestChess \
  -configuration Release \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=25423278-D058-4FD7-95FE-7BA695DA23CE' \
  -derivedDataPath /tmp/sqc-ios-283ad0f0-release-derived \
  -resultBundlePath /tmp/sqc-ios-283ad0f0-release-build.xcresult \
  CODE_SIGNING_ALLOWED=NO build
```

Result: `** BUILD SUCCEEDED **`.

The build-only result bundle is preserved at `/tmp/sqc-ios-283ad0f0-release-build.xcresult`. It contains zero tests and must not be presented as XCTest evidence.

Inspected Release Simulator `.app`:

- Bundle ID/name/version/build: `com.sidequestchess.app` / Side Quest Chess / `0.1.349` / `1`
- SDK/toolchain: iOS Simulator `26.5`; Xcode `26.6` (`17F113`)
- Minimum OS/device families: iOS `15.1`; iPhone and iPad
- `main.jsbundle`: present, 3,724,342 bytes; SHA-256 `90998b13c2aab48c1595bc4eddba5ef09f463ba3a16e16250faa0c9af38c5756`
- App size: approximately 97 MB
- Signature: ad-hoc/linker-signed; no Team ID and no embedded provisioning profile

This is not a signed archive, IPA, TestFlight build, or physical-device candidate.

## Simulator launch evidence

The same Release Simulator `.app` was installed and launched on two materially different current-runtime destinations:

| Destination | UDID | Runtime | Result |
| --- | --- | --- | --- |
| iPhone 17e | `25423278-D058-4FD7-95FE-7BA695DA23CE` | iOS 26.5 | Installed and launched as PID 32694; settled 1170×2532 capture rendered Side Quest Chess |
| iPad Pro 13-inch (M5) | `02189F8B-B2ED-49AF-83B5-E630C8059EB1` | iOS 26.5 | Installed and launched as PID 32737; settled 2064×2752 capture rendered Side Quest Chess |

Apple Vision OCR found the full public name **Side Quest Chess** in both settled captures. Capture hashes:

- iPhone 17e: `979fa016759d5bd2a91d91dae40e613828d0db319dc678643318f78f1339ddbb`
- iPad Pro 13-inch: `0f1d9e0cd54dc2e0b9d6d554a2dc91913de736b20143c6f630bffe2b5e404491`

A `sidequestchess://sso-callback` `simctl openurl` probe was accepted on both devices and displayed the system open-app confirmation. This is registered scheme routing only; it is not successful provider authentication or callback-state validation.

Both bounded simulators were shut down afterward. These signed-out Simulator captures are QA evidence, not App Store listing screenshots.

## Fail-closed remaining gates

The candidate is **not launch-ready**. Blocking gates remain:

1. Correct Crowdler AB Apple Developer legal team and active membership.
2. Dedicated Crowdler/Sam operational Apple identity and least-privilege Apple Developer/App Store Connect scope; Andreas's personal identity remains prohibited.
3. Live duplicate/App ID/app-record/SKU reconciliation for `com.sidequestchess.app` and the highest existing build number.
4. Owner-approved source freeze and unique iOS build number.
5. Crowdler-managed signing, signed archive/IPA, final entitlement/privacy/export inspection, and account-tied capability configuration.
6. End-to-end Apple/Google/Facebook authentication, callback, linking, relay-email behavior, provider authorization revocation, and account deletion on the exact candidate.
7. Privacy labels reconciled against Clerk, providers, backend logs, SDKs, and the exact IPA.
8. Complete UGC filtering, central moderation response/removal workflow, and abusive-user blocking evidence.
9. Fresh same-candidate App Store screenshots on accepted iPhone and required 13-inch iPad dimensions and states.
10. Approved TestFlight upload, store-delivered installation, and signed-in smoke on a real iPhone.
11. App Store Connect metadata/privacy/age/review read-back, followed by separately approved submission and public release.
12. Android and web public launch must precede iOS App Review submission and public release; preparation and approved TestFlight work may proceed earlier.

No Apple account, credential, signing, App Store Connect, TestFlight, submission, payment, legal, external communication, or release mutation was attempted.
