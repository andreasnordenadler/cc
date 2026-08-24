# Side Quest Chess — current iOS Simulator build receipt

**Executed:** 2026-08-24  
**Source:** `283ad0f0821a125376004ec1599f1fe01a54c302` (`origin/main`, reconciled immediately before generation and before this receipt)  
**Lockfile SHA-256:** `5edd63864c5af4d5a85718e5af02bc769ae7634d8b8b60349a4f08c03d3317e9`  
**Scope:** unsigned local Simulator evidence only. This is not an archive, IPA, Apple signing, TestFlight, physical-device, App Store Connect, review, or release receipt.

## Toolchain and destination

- macOS 26.5.2 (`25F84`)
- Xcode 26.6 (`17F113`) selected at `/Applications/Xcode.app/Contents/Developer`
- CocoaPods 1.17.0
- pnpm 10.29.1; Node.js 22.22.0
- iOS 26.5 Simulator runtime (`23F77`)
- iPhone 17 Pro, UDID `94D16E18-197E-43FD-A133-572FF0A7FBE4`
- iPad Pro 13-inch (M5), UDID `02189F8B-B2ED-49AF-83B5-E630C8059EB1`
- Local signing inventory: `0 valid identities found`

## Native generation and project discovery

A clean isolated worktree at the exact source commit completed:

1. `pnpm install --frozen-lockfile`
2. `CI=1 pnpm --dir apps/mobile exec expo prebuild --platform ios --no-install`
3. `pod install`

CocoaPods installed 85 dependencies / 84 pods. The generated tree was disposable and was removed after inspection; no generated native source was retained.

Discovered workspace and application scheme:

- Workspace: `apps/mobile/ios/SideQuestChess.xcworkspace`
- Scheme: `SideQuestChess`
- Configuration receipts: Debug and Release
- SDK: `iphonesimulator26.5`

Generated and built identity:

- Display name: `Side Quest Chess`
- Bundle ID: `com.sidequestchess.app`
- Version/build: `0.1.349` / `1` (provisional local generated build; not reconciled with App Store Connect)
- Minimum iOS: `15.1`
- Device family: iPhone and iPad (`1,2`)
- URL schemes: `sidequestchess`, `com.sidequestchess.app`
- Sign in with Apple entitlement intent: `com.apple.developer.applesignin = Default`
- ATS arbitrary loads: false; local networking: true
- No sensitive-resource usage descriptions appeared in the generated Info.plist

The CocoaPods aggregate `PrivacyInfo.xcprivacy` declared tracking false, no native collected-data rows, and required-reason API categories for file timestamps, user defaults, disk space, and system boot time. This generated aggregate is not a final App Privacy answer and must be reconciled against the signed archive, backend, providers, and actual data handling.

## Build results

Both exact-destination unsigned builds passed:

- Debug Simulator build: **PASS** — `** BUILD SUCCEEDED **`
- Release Simulator build with bundled `main.jsbundle`: **PASS** — `** BUILD SUCCEEDED **`
- Target dependency graph: 92 targets
- Release bundle SHA-256: `c06a14f3e0ec608d808ca44950488f6f842c67ff678138df2986d1f860374b02`

The Release build emitted React Native/Hermes static-analysis warnings for runtime-provided globals and the usual CocoaPods script-phase dependency notes. It did not emit a build failure. There are no discovered iOS test targets or test plans in the generated workspace, so no `.xcresult` test bundle was produced; JavaScript/source tests remain a separate gate.

## Install and launch results

The exact Release `.app` installed and launched on both declared simulators:

- iPhone launch PID: `92767`
- iPad launch PID: `93031`
- Both processes created an active app scene and fetched production Side Quest Chess resources over successful TLS.
- Signed-out API behavior included an expected unauthenticated `401`; other startup resources returned `200`.
- No launch crash was observed in the captured process logs.

Fresh post-load screenshots were captured and OCR-reviewed:

| Device | Pixels | SHA-256 | OCR-visible candidate state |
| --- | ---: | --- | --- |
| iPhone 17 Pro | 1206×2622 | `478dcd95d34fad3bef40185d2b471729b69c73a7baa3c41b228041baf41fe5e4` | `Side Quest Chess`, `Sign in to continue.`, Solo and Multiplayer browse actions, sign-in method action |
| iPad Pro 13-inch (M5) | 2064×2752 | `e81d69ce9718f4795ea0efc858e3632f16c9d61b0856874012d4d911bec73801` | Same signed-out surface and public name at required 13-inch screenshot dimensions |

The captures prove only these launch states. They are not App Store screenshots, responsive visual acceptance, interaction coverage, authentication/deep-link verification, accessibility evidence, or physical-device evidence.

## Observed runtime warnings and remaining gates

Runtime logs reported:

- Expo/React Native delegate methods for background fetch and remote-notification fetch are implemented while the corresponding `UIBackgroundModes` values are absent.
- The current UIKit lifecycle emitted a forward-looking warning that `UIScene` lifecycle adoption will become required.
- CoreUI emitted Simulator theme-registration diagnostics.

These warnings did not prevent this launch, but they require dependency/toolchain-owner reconciliation before source freeze; do not add background modes unless Side Quest Chess actually needs and is approved to use them.

Still blocked or unverified:

- Correct Crowdler AB Apple Developer team and dedicated Crowdler/Sam operational identity
- Duplicate/App ID/App Store app-record reconciliation and unique build-number readback
- Apple capability/provider configuration, signed IPA identity, export compliance, and exact-archive privacy inventory
- Sign in with Apple, Google, and Facebook callback/revocation/deletion behavior on a real iPhone
- Guideline 1.2 moderation workflow and complete block/filter outcomes
- Same-candidate responsive and accessibility journeys on iPhone/iPad, including iPad multitasking widths
- Fresh candidate-bound App Store screenshots beyond the launch-state receipt
- TestFlight upload, store-delivered real-iPhone install, review submission, approval, and public availability

Every account, legal, signing, upload, tester, metadata mutation, submission, and release action remains separately approval-gated. Andreas's personal EAS/Apple identity was not used.
