# Side Quest Chess iOS release packet — updated 2026-08-14

Status: source-preparation packet only. It is not evidence of an Apple build, TestFlight delivery, App Review submission, or public release.

## Candidate reconciled from `origin/main`

- Reconciled `origin/main` baseline: `d4e2cb7b83df0d0697f1873f229dde04471c41d5` (fetched 2026-08-14)
- Current Android launch baseline: Google Play Internal testing accepted build `0.1.349` / code `350`; Android production remains inactive and separately approval-gated
- App name: Side Quest Chess
- Expo source version: `0.1.349`
- Bundle ID candidate: `com.sidequestchess.app`
- Scheme: `sidequestchess`
- Authentication callback: `sidequestchess://sso-callback`
- Production API: `https://sidequestchess.com`
- Tablet policy in source: iPhone and iPad (`supportsTablet: true`)
- Publisher and privacy controller: Crowdler AB
- Audience and availability: worldwide, ages 13 and older
- Business model: free; no advertising, in-app purchases, subscriptions, or real-money prizes
- Launch order: web and Android precede iOS

This packet supersedes candidate/version claims in the July 2026 Apple and store-preparation documents. Any later release must replace the source SHA, version, build number, screenshots, binary inspection, and device receipts together.

## Current gate state

| Gate | State | Required evidence |
| --- | --- | --- |
| Correct Crowdler AB Apple team and dedicated Sam/Crowdler identity | BLOCKED | Team legal name, Team ID, dedicated identity, role, and access receipt |
| Bundle/App identity has no duplicate | BLOCKED | Apple Developer bundle lookup and App Store Connect app lookup |
| Source candidate frozen | NOT FROZEN | Approved release commit and clean-tree receipt |
| Signed IPA identity inspected | BLOCKED | IPA checksum, bundle/version/build, signature, entitlements, privacy manifests, SDK list |
| iOS auth/deep link | BLOCKED — CONFIG AND DEVICE UNVERIFIED | Verify the production Clerk redirect allowlist, then verify every submitted sign-in method and cold-start callback on a real iPhone |
| Sign in with Apple policy | SOURCE-PREPARED, ACCOUNT/DEVICE BLOCKED | Source declares the Sign in with Apple capability and uses Clerk's native Apple flow while retaining Google, Facebook, and email/password. The dedicated Crowdler Apple team must configure the bundle capability and Clerk provider/account linking, then every method must pass on the exact iPhone candidate |
| Privacy labels | DRAFT ONLY | Binary/SDK inspection plus adopted App Store Connect answers |
| Current screenshots | BLOCKED | Captures from the exact TestFlight candidate on required Apple display sizes |
| TestFlight real-iPhone smoke | BLOCKED | Store-delivered install and signed-in checklist receipt |
| iPad acceptance | BLOCKED | Responsive matrix and exact-candidate screenshots, or approved source change disabling tablet support |
| Review account and deletion path | PARTIAL | Disposable reviewer account and successful disposable-account deletion on TestFlight |
| App Review submission | NOT STARTED | Separate approval and App Store Connect state receipt |
| Public availability | NOT STARTED | Separate release approval and storefront availability receipt |

## Approval boundary

Do not perform any of the following without explicit approval: enroll or pay; accept legal, tax, or banking terms; create or mutate Apple/App Store Connect records; invite or accept account users where attestations apply; create account-tied certificates, identifiers, profiles, or API keys; upload a build; add testers; adopt privacy/age/content-rights answers; submit for review; or release publicly. Do not use Andreas's personal Apple identity.

## App Store listing draft

### App information

| Field | Draft value |
| --- | --- |
| Name | Side Quest Chess |
| Subtitle | Chess quests and proof |
| Primary category | Games |
| Subcategory | Board |
| Secondary subcategory | Strategy |
| Price | Free |
| Copyright | 2026 Crowdler AB |
| Privacy Policy URL | https://sidequestchess.com/privacy |
| Support URL | https://sidequestchess.com/support |
| Marketing URL | https://sidequestchess.com |
| Terms URL | https://sidequestchess.com/terms |
| SKU | Owner to assign; suggested `sidequestchess-ios` |
| Primary locale | Owner to confirm; suggested English (U.S.) |
| Content rights | Yes, the app accesses third-party public chess records; owner must attest that Side Quest Chess has the necessary rights before adoption |
| Territories | Worldwide target; owner/legal must resolve any storefront-specific game authorization requirement before selecting affected territories |
| Release method | Manual release recommended; App Review submission and public release require separate approvals |

### Keywords

`chess,challenges,side quests,multiplayer,goals,training,board,strategy,puzzles,achievements`

### Promotional text

Turn ordinary games into ridiculous chess challenges. Pick a Solo or Multiplayer Side Quest, play on Lichess or Chess.com, then check public game records for proof.

### Description

Side Quest Chess began on the web and Android. The iOS app brings the same chess-challenge experience to iPhone and iPad.

Pick a playful Solo or Multiplayer Side Quest, play your game on Lichess or Chess.com, and ask Side Quest Chess to check eligible public game records. Save progress, inspect proof receipts, create custom challenges, join community quests, and build your Trophy Cabinet.

Features:

- Browse official and community Solo Side Quests
- Create custom Side Quests
- Create or join Multiplayer Side Quests
- Verify challenges against public Lichess or Chess.com records
- Save progress and proof receipts to your Side Quest Chess account
- View your Trophy Cabinet
- Report community content and block creators
- Permanently delete your account in the app

Side Quest Chess never asks for your Lichess or Chess.com password and is independent from Lichess and Chess.com. There are no ads, in-app purchases, subscriptions, or real-money prizes. Intended for ages 13 and older.

### First-version release notes

First iOS release. Side Quest Chess follows the existing web and Android experience with Solo, Custom, Community, and Multiplayer Side Quests; public-game proof checks; account sync; Trophy Cabinet; support; reporting; blocking; and in-app account deletion.

## Age-rating draft

Owner must adopt the answers in App Store Connect after checking the current questionnaire wording. Product-fact draft:

- Gambling, simulated gambling, contests, loot boxes, and real-money prizes: none
- In-app purchases and advertising: none
- Sexual content, nudity, alcohol, tobacco, drugs, horror, profanity, violence, and medical content: none as publisher-provided content
- User-generated content: yes — custom/community quest text, profiles, and multiplayer content
- Unrestricted web access: no general browser; the app opens specific legal/support pages and public proof/share destinations
- Messaging/chat: no general real-time chat; signed-in users can send support notes
- Location sharing: none
- Recommended distribution posture: 13+ because account/community features are intended for ages 13 and older

## App Privacy draft

Tracking: **No**, provided binary and provider review confirms no SDK performs cross-company tracking. No data is used for third-party advertising, developer advertising, or sale to data brokers.

Conservative linked-data draft:

| Apple category | Type | Purpose |
| --- | --- | --- |
| Contact Info | Name, email address | App functionality, account management, customer support |
| Identifiers | User ID | App functionality, account management, security |
| User Content | Customer support; other user content | Support and app functionality |
| Usage Data | Product interaction for signed-in events | Analytics, functionality, personalization |
| Diagnostics | Other diagnostic data in an optional, user-approved support bundle | Customer support and app functionality |
| Other Data | Public chess usernames, public game/profile records, game IDs, proof/quest state and timestamps where no narrower Apple type fits | App functionality |

Anonymous product-interaction events may be not linked to an account. Do not declare crash data, performance data, device ID, location, photos, contacts, purchases, browsing/search history, or sensitive information until the exact IPA, Clerk, Expo, React Native, and embedded privacy manifests have been inspected. The optional support bundle is user-approved before transmission but is still collected when sent and must not be omitted from the adopted label. Adopted answers must match `https://sidequestchess.com/privacy` and actual production behavior.

Account deletion wording: My Account → Delete account permanently removes the sign-in identity and account-attached profile/progress data after replicated multiplayer references are cleaned. A cleanup failure must preserve the sign-in identity and return an error.

## Review information draft

- Organization: Crowdler AB
- Review contact: owner must provide an authorized person's name and reachable phone
- Contact email candidate: `sam@crowdler.com` (owner must confirm)
- Credentials: create an owner-authorized disposable review account; enter credentials only in App Store Connect
- Account should have a verified email/password and a valid public Lichess or Chess.com username, without personal or sensitive content

### Paste-ready review notes

Side Quest Chess began as a web product and Android app. This submission is the first iOS release of the same experience.

The app lets users choose playful chess challenges and verify eligible results against public game records from Lichess or Chess.com usernames supplied by the user. Side Quest Chess does not request or store Lichess or Chess.com passwords and is independent from those services.

Public Side Quests can be browsed while signed out. Sign-in is required to save progress, check proof, create or join account-backed quests, send support messages, report or block Community creators, and manage or delete an account.

Suggested review flow: browse Solo and Multiplayer while signed out; sign in under My Account; inspect the connected public chess username; start a Solo Side Quest and open proof controls; create a Custom Side Quest; create or join a Multiplayer Side Quest; open a Community creator, use its report and block controls, and note that blocked creators can be managed from My Account; open Trophy Cabinet; send a support note and optionally preview the diagnostics bundle; verify Privacy Policy, Support, and Terms under Help & Support; then inspect My Account → Delete account. The supplied account is disposable and may be deleted by review; deletion permanently removes its Side Quest Chess identity and account-attached data.

The app has no advertising, in-app purchases, subscriptions, gambling, or real-money prizes. It is intended for users aged 13 and older. The expected native OAuth callback is `sidequestchess://sso-callback`.

## Screenshot and preview plan

Capture only from the exact accepted TestFlight build, with production-like non-personal data and no debug overlays. App Store Connect determines the currently required dimensions; record those requirements at capture time rather than relying on stale pixel lists.

Required device families while `supportsTablet` remains true:

- Largest required iPhone display class, portrait
- Any additional iPhone class required by App Store Connect
- Largest required iPad display class, portrait and landscape where the UI supports it
- Localized sets for every submitted locale; initial recommendation is English only until localization is product-approved

Suggested ordered frames: Home/active Side Quest; Solo catalog; quest detail and proof receipt; Multiplayer discovery/detail; Trophy Cabinet; Custom Side Quest builder. Avoid login forms, deletion confirmations, support threads, empty/error states, third-party trademarks as the focal claim, and real user data. App previews are optional; do not prepare one unless current-candidate interaction footage materially improves the listing.

## Same-candidate responsive QA matrix

Run clean install and update install on current supported OS versions. Record device, OS, TestFlight build, source SHA, orientation/window size, tester, timestamp, and result.

The current Expo configuration restricts iPhone to portrait. Do not claim iPhone landscape support unless that configuration is deliberately changed and reverified.

| Surface | iPhone portrait | iPad portrait | iPad landscape/full | iPad split view/Stage Manager |
| --- | --- | --- | --- | --- |
| Cold launch, bootstrap, offline/reconnect | Required | Required | Required | Required |
| Signed-out Home/Solo/Multiplayer | Required | Required | Required | Required |
| Auth sheets and OAuth browser return | Required | Required | Required | Required |
| Account/profile/keyboard | Required | Required | Required | Required |
| Solo detail, proof, share, reset | Required | Required | Required | Required |
| Custom builder and unsaved changes | Required | Required | Required | Required |
| Multiplayer create/detail/join/proof | Required | Required | Required | Required |
| Trophy Cabinet and modals | Required | Required | Required | Required |
| Help/legal/support and deletion | Required | Required | Required | Required |
| VoiceOver, Dynamic Type, contrast, targets | Required | Required | Required | Required |

Fail for clipped or unreachable controls, content hidden under safe areas/keyboard, unusable modal sizing, unexpected orientation resets, lost form state, broken callback routing, or layout overlap. If the iPad matrix cannot pass, disable tablet support in a separately approved candidate before screenshots/build freeze.

## TestFlight real-iPhone smoke

1. Verify TestFlight-delivered install, app name, icon, version/build, clean launch, and production API.
2. Browse signed out; open Privacy, Support, and Terms.
3. Create/verify a disposable email/password account, including email verification, session persistence, and cold-start relaunch. Test native Sign in with Apple, including cancellation and private-relay email behavior. Separately test Google and Facebook through `sidequestchess://sso-callback`, including cancellation and cold-start return. Confirm an existing social-only account remains accessible and that provider account linking does not create an unintended duplicate.
4. Confirm session persistence, account API bearer acceptance, profile edits, website sync, sign-out, and sign-in restoration.
5. Exercise Solo start/check/explicit proof/failure/success/view/share/reset.
6. Exercise Custom create/edit/start/check/reset and Community detail/share/report/block.
7. Exercise Multiplayer create/share/join with a second account, refresh, proof, leave, report, and block.
8. Verify Trophy Cabinet, signed-in support message, diagnostics default-off and opt-in behavior.
9. Test offline launch/reconnect, background/foreground, forced termination/relaunch, keyboard, rotation, VoiceOver, and Dynamic Type.
10. Delete a disposable account in-app; confirm signed-out relaunch and server/identity cleanup behavior.
11. Inspect runtime/network logs for secrets, tokens, passwords, or unexpected personal data.

## Least-privilege Apple access packet

Use a dedicated Sam/Crowdler operational Apple Account with multi-factor authentication and Crowdler-controlled recovery methods. Do not invite Andreas's personal identity for operational work.

The Expo project is currently configured with owner `and72nor` and project ID `9af73cb2-dcd5-4429-b194-67fc81206937`. Before any cloud build, separately verify and authorize least-privilege access for the dedicated Crowdler operator or an approved organization-level transfer. Do not run EAS build, credentials, or submit commands through Andreas's personal session.

Owner-approved sequence:

1. Verify Apple Developer membership is legally held by Crowdler AB; record Team ID and membership status.
2. Invite the dedicated identity in App Store Connect with **App Manager** limited to Side Quest Chess if app-scoped access is available. This supports metadata, TestFlight, and submission while avoiding Account Holder/Admin powers.
3. Grant **Developer** instead if the immediate task is build/TestFlight technical work only; elevate to App Manager only when metadata/submission work is authorized.
4. Do not grant Admin, Finance, Legal, banking, tax, or Account Holder privileges for routine release operations.
5. Apple Developer resources (bundle IDs, certificates, profiles, Sign in with Apple) may require separate developer-resource permission. Grant only after the exact credential operation is approved.
6. Prefer App Store Connect API access scoped to the minimum role and app when automation is approved. Keep private keys outside the repository, record issuer/key IDs in the approved secret manager, and revoke unused keys.
7. Record inviter, invitee, role, app scope, Team ID, date, review date, and revocation owner.

This packet does not authorize an invite, acceptance, credential generation, app-record mutation, or upload.

## Build and binary acceptance

Before upload, freeze the commit and record EAS build ID, source SHA, version/build, archive/IPA SHA-256, builder image, and dependency lock hash. Inspect the IPA for:

- `CFBundleIdentifier = com.sidequestchess.app`
- `CFBundleDisplayName = Side Quest Chess`
- expected version and unique build number
- `sidequestchess` URL scheme
- production API/configuration and no development server references
- distribution signature and Crowdler AB team
- only intended entitlements
- `ITSAppUsesNonExemptEncryption = false`, assuming only exempt standard platform/library encryption remains true
- embedded privacy manifests and SDK signatures
- no sensitive usage descriptions or permissions absent a feature and adopted privacy disclosure
- no unexpected advertising, tracking, purchase, location, camera, microphone, photo, contact, or biometric SDK/capability

Submission, App Review acceptance, release approval, and public storefront availability are four distinct states and must be reported separately.

## Local source-readiness receipt — 2026-08-14

- The dedicated iOS worktree was clean before reconciliation and was rebased onto fetched `origin/main` `d4e2cb7b83df0d0697f1873f229dde04471c41d5`; the dirty canonical checkout was not modified or cleaned.
- Full canonical test suite: 736/736 passed.
- Full lint: passed with zero errors and four pre-existing warnings.
- Full Next production build: passed and generated all 88 static pages.
- `expo-doctor --verbose`: 18/18 checks passed.
- Mobile TypeScript check: passed.
- Focused iOS configuration, authentication, deletion, and privacy tests: 25/25 passed.
- Expo config introspection produced `com.sidequestchess.app`, URL schemes `sidequestchess` and `com.sidequestchess.app`, `com.apple.developer.applesignin = Default`, and `ITSAppUsesNonExemptEncryption = false`.
- A local iOS JavaScript export completed: 853 modules bundled into a 3.71 MB Hermes bytecode file; export directory size 53 MB; bytecode SHA-256 `a8b57cdc063fb8a6ff6eddb73bf384bbfedcaffae4b7c453caebad6163dddb5d`. This is not a native archive or IPA.
- App Store draft field lengths are within current limits: subtitle 22 characters, keywords 91 UTF-8 bytes, promotional text 164 characters.
- Lockfile SHA-256 after reconciliation: `35f1e3fa53d7b0f7652929b4f9217586e9a46174ae502d500cb7645ad392af15`.
- Local Apple toolchain remains blocked: selected developer directory is Command Line Tools, `xcodebuild` requires full Xcode, and zero valid code-signing identities are installed.
- EAS remains authenticated as `and72nor` / `andreas.nordenadler@gmail.com`; this identity is prohibited for new Apple operational access or credentials. No EAS build, credential, submit, App Store Connect, or Apple account mutation was attempted.
- This is source/config evidence only. No archive, IPA, signing, TestFlight, real-device, screenshot, review, or storefront claim is implied.
