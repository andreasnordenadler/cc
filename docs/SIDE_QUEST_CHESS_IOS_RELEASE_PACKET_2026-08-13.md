# Side Quest Chess iOS release packet — updated 2026-08-15

Status: source-preparation packet only. It is not evidence of an Apple build, TestFlight delivery, App Review submission, or public release.

## Candidate reconciled from `origin/main`

- Reconciled `origin/main` baseline: `695f76e35c137ed5b38e3a1dc18ed96405b3c5ba` (fetched and merged 2026-08-15). Working-branch reconciliation merge before the edits in this packet: `847e50dd5700a35d82e5e28ddce31e16fb857d7a`. The candidate remains unfrozen.
- Current Android distribution baseline: Google Play Internal testing accepted build `0.1.349` / code `350`, built from immutable source `189c93a350eb48d2a325f3a3f4edd99ed110c4b5`; Android production/public launch remains inactive and separately approval-gated. The current iOS-preparation branch still has Android source code `349` and is not the code-350 Android artifact.
- App name: Side Quest Chess
- Expo source version: `0.1.349`
- Source-controlled iOS build number: `1` (candidate only; must be reconciled against App Store Connect before freeze)
- Bundle ID candidate: `com.sidequestchess.app`
- Scheme: `sidequestchess`
- Authentication callback: `sidequestchess://sso-callback`
- Production API: `https://sidequestchess.com`
- Tablet policy in source: iPhone and iPad (`supportsTablet: true`)
- Publisher and privacy controller: Crowdler AB
- Audience and availability target: worldwide and intended for ages 13 and older; this is a product/legal draft, not an adopted App Store territory selection or calculated Apple age rating
- Business model: free; no advertising, in-app purchases, subscriptions, or real-money prizes
- Launch order: the public web product is already available; Android public launch must precede iOS. Android currently has a physically accepted private Internal-testing build, not a public launch.

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
| Primary Games subcategory | Board |
| Secondary Games subcategory | Strategy |
| Price | Free |
| Copyright | 2026 Crowdler AB |
| Privacy Policy URL | https://sidequestchess.com/privacy |
| Support URL | https://sidequestchess.com/support |
| Marketing URL | https://sidequestchess.com |
| In-app/review-note Terms destination (not a standard listing URL field) | https://sidequestchess.com/terms |
| App Store version | Candidate `0.1.349`; owner must approve the customer-facing version before record mutation |
| SKU | Owner to assign; suggested `sidequestchess-ios` (immutable after app-record creation) |
| Primary locale | Owner to confirm; suggested English (U.S.) |
| Bundle/App Store association | Unverified; discover existing bundle/app records and Apple app ID before creation |
| Secondary category | None recommended initially; category fields must be reconciled against the live App Store Connect form |
| Content rights | Yes, the app accesses third-party public chess records; owner must attest that Side Quest Chess has the necessary rights before adoption |
| Territories | Worldwide target; owner/legal must resolve any storefront-specific game authorization requirement before selecting affected territories |
| Release method | Manual release recommended; App Review submission and public release require separate approvals |
| License agreement | Standard Apple agreement recommended; any custom agreement requires owner/legal approval |
| Review contact | First name, last name, reachable phone, and email remain owner-supplied fields |

### Keywords

`chess,challenges,side quests,multiplayer,goals,training,board,strategy,proof,trophies`

### Promotional text

Turn ordinary games into ridiculous chess challenges. Pick a Solo or Multiplayer Side Quest, play on Lichess or Chess.com, then check public game records for proof.

### Description

Side Quest Chess is available on the web. The iOS app brings its chess-challenge feature set to iPhone and iPad.

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

### Internal first-version summary

Use this in review context if requested; do not assume App Store Connect exposes release notes for version 1.0. First iOS release. Side Quest Chess follows the public web product and the Android private Internal-testing experience with Solo, Custom, Community, and Multiplayer Side Quests; public-game proof checks; account sync; Trophy Cabinet; support; reporting; blocking; and in-app account deletion.

## Age-rating draft

Owner must adopt the answers in App Store Connect after checking the current questionnaire wording. Product-fact draft:

- Gambling, simulated gambling, contests, loot boxes, and real-money prizes: none
- In-app purchases and advertising: none
- Publisher-authored sexual content, nudity, alcohol, tobacco, drugs, horror, profanity, violence, and medical content: none
- User-generated content: yes — profile names/bios, custom/community quest text, multiplayer text, and support messages. Answer every frequency/content question for the entire reachable UGC experience rather than treating publisher-authored content as the whole app; reporting and blocking controls are present.
- Unrestricted web access: no general browser; the app opens specific legal/support pages and public proof/share destinations
- Messaging/chat: no general real-time chat; signed-in users can send support notes
- Location sharing: none
- Product distribution posture: intended for ages 13 and older. Record and use Apple's calculated rating from the then-current questionnaire; do not represent the product posture as a predicted calculated rating.

Capability-answer draft to map field-by-field onto the live dated questionnaire: user-generated content **Yes**; reporting controls **Yes**; blocking controls **Yes**; general messaging/chat **No**; unrestricted web access **No**; advertising **No**; in-app purchases **No**; loot boxes **No**; gambling/simulated gambling/real-money gaming **No**; contests/sweepstakes **No**; location sharing **No**; parental controls **No**; age-assurance mechanism inside the app **No**; publisher-authored mature-content descriptors listed above **None**. Record the exact questionnaire version/date, every displayed question and selected frequency, Apple-calculated rating, and any regional override before adoption. UGC frequency/exposure cannot be safely preselected without the live Apple wording and an owner review of the reachable Community/profile text.

## App Privacy draft

Tracking: **No**, provided binary and provider review confirms no SDK performs cross-company tracking. No data is used for third-party advertising, developer advertising, or sale to data brokers.

Conservative per-type draft. All listed rows are **collected**, **linked to the user**, and **not used for tracking** unless final provider/binary inspection proves otherwise:

| Apple category / type | Purpose(s) | Source and behavior to reconcile |
| --- | --- | --- |
| Contact Info / Name | App functionality, account management | Clerk account and runner display name |
| Contact Info / Email Address | App functionality, account management, customer support | Email/password or Apple/Google/Facebook provider identity; Apple private-relay addresses are possible |
| Identifiers / User ID | App functionality, account management, security | Clerk user/session identity and application records |
| User Content / Photos or Videos | App functionality | Profile image supplied by Clerk or the selected sign-in provider; no native photo-library access is requested |
| User Content / Customer Support | Customer support, app functionality | Signed-in support messages and any user-approved diagnostics included with them |
| User Content / Other User Content | App functionality, safety | Profile text, public chess usernames, custom/community quest text, Multiplayer text, reports, blocks, report-target identifiers, proof/game IDs, proof and quest state, and timestamps |
| Usage Data / Product Interaction | Analytics, app functionality, personalization | Signed-in event totals/recent events, quest IDs/status, and coarse device type stored in account metadata |
| Diagnostics / Other Diagnostic Data | Customer support, app functionality | Optional support bundle: app build/version, package, platform/device, API destination, connected chess usernames, active quest, and Multiplayer counts; default off and previewed before send |

Anonymous product-interaction events may be not linked to an account; verify the production analytics path before adoption. Display names, usernames, provider profile images, standings, Community content, and proof details may be publicly visible by product design. Clerk and the selected Apple, Google, Facebook, or email/password sign-in path process authentication data; hosting and chess-record providers process the data described by the public policy. Reports and blocks are retained for safety/abuse handling as applicable. Account deletion removes account-attached identity/profile/progress after required cleanup, subject to security, legal, fraud-prevention, backup, and de-identified/aggregate exceptions stated in the adopted policy. Do not declare crash data, performance data, device ID, location, contacts, purchases, browsing/search history, or sensitive information until the exact IPA, Clerk, Expo, React Native, and embedded privacy manifests have been inspected. The optional support bundle is collected when sent despite being opt-in. Adopted answers must match `https://sidequestchess.com/privacy`, provider contracts, retention behavior, and the production binary.

Account deletion wording: My Account → Delete account permanently removes the sign-in identity and account-attached profile/progress data after replicated multiplayer references are cleaned. A cleanup failure must preserve the sign-in identity and return an error.

## Review information draft

- Organization: Crowdler AB
- Review contact: owner must provide an authorized person's name and reachable phone
- Contact email candidate: `sam@crowdler.com` (owner must confirm)
- Credentials: create owner-authorized disposable primary and secondary review accounts; enter credentials only in App Store Connect
- Primary account: verified email/password, deterministic seeded Solo/Custom/Trophy state, and a valid non-personal public Lichess or Chess.com username
- Secondary account: deterministic Multiplayer participant; use a separate deletion-only account if deletion must be exercised
- Record whether MFA is disabled/absent for each review account, exact expected fixtures/results, reset owner, and reachable review contact before submission

### Paste-ready review notes

Side Quest Chess began as a web product. Android has a private Internal-testing build; this submission is the first iOS release of the same experience.

The app lets users choose playful chess challenges and verify eligible results against public game records from Lichess or Chess.com usernames supplied by the user. Side Quest Chess does not request or store Lichess or Chess.com passwords and is independent from those services.

Public Side Quests can be browsed while signed out. Sign-in is required to save progress, check proof, create or join account-backed quests, send support messages, report or block Community creators, and manage or delete an account.

Suggested review flow: browse Solo and Multiplayer while signed out; sign in under My Account; inspect the connected public chess username; open the seeded Solo Side Quest and its proof controls/receipt; inspect the seeded Custom Side Quest and deterministic Multiplayer fixture using the supplied second account; open a Community creator and inspect report/block controls; open Trophy Cabinet; preview support diagnostics (off by default); and verify Privacy Policy, Support, Terms, and My Account → Delete account. Reporting, blocking, support submission, quest mutation, and deletion are optional demonstrations because they mutate shared review state. If deletion testing is required, use the separate deletion-only account; deletion permanently removes that account's Side Quest Chess identity and account-attached data. Review credentials, fixture IDs, expected results, reset instructions, and fallback routes must be completed in App Store Connect before submission.

The app has no advertising, in-app purchases, subscriptions, gambling, or real-money prizes. It is intended for users aged 13 and older. Sign in with Apple uses Apple's native sheet through Clerk. Google and Facebook use the expected OAuth callback `sidequestchess://sso-callback`.

## Screenshot and preview plan

Capture only from the exact binary selected for App Review, with production-like non-personal data and no debug overlays. App Store Connect determines the currently required dimensions, formats, counts, display classes, and locale slots; record those requirements at capture time rather than relying on stale pixel lists.

Required device families while `supportsTablet` remains true:

- Largest required iPhone display class, portrait
- Any additional iPhone class required by App Store Connect
- Largest required iPad display class, portrait and landscape where the UI supports it
- Localized sets for every submitted locale; initial recommendation is English only until localization is product-approved

Suggested ordered frames: Home/active Side Quest; Solo catalog; quest detail and proof receipt; Multiplayer discovery/detail; Trophy Cabinet; Custom Side Quest builder. Avoid login forms, deletion confirmations, support threads, empty/error states, third-party trademarks as the focal claim, and real user data. App previews are optional; do not prepare one unless current-candidate interaction footage materially improves the listing.

Maintain a screenshot manifest with App Store version/build, source SHA, TestFlight/build ID, device/display class, OS, orientation, locale, account/fixture state, caption, filename, exact dimensions, and SHA-256 for every frame. Acceptance checks: no clipping or safe-area overlap; no keyboard/modal residue; consistent status bar; baseline and larger Dynamic Type legibility; no personal identifiers, invite codes, stale Android/GitHub labels, or debug data; and truthful earned/locked trophy and proof states.

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

### Owner authorization packets — discovery and mutation are separate

**Discovery authorization:** authorize read-only inspection only if the dedicated Crowdler/Sam operational Apple Account is already provisioned on the correct Crowdler AB team. Do not send passwords, recovery codes, private keys, certificates, or review credentials.

**Why:** source preparation cannot verify the fail-closed legal-team, duplicate bundle/app identity, and least-privilege operator gates without read access to the correct Crowdler AB Apple Developer and App Store Connect context.

**Requested authorization (no mutation):** using only an already provisioned dedicated Crowdler/Sam identity, authorize read-only discovery of Team ID/membership status, existing bundle ID `com.sidequestchess.app`, existing Side Quest Chess App Store Connect records/SKUs, highest existing iOS build number, and current EAS project ownership/access. Do **not** authorize an invitation or acceptance, enrollment, payment, agreements, tax/banking, Admin/Finance/Legal access, app-record creation or edits, certificate/profile/key generation, Sign in with Apple configuration, EAS/Apple credential access, builds, uploads, testers, metadata adoption, submission, or release.

**Return receipt required:** legal entity, Team ID, membership expiry/status, dedicated operator address, existing role and app scope, duplicate-search results for bundle ID and app name, any existing app-record ID/SKU/bundle association, highest existing iOS build number, EAS owner/project access result, and screenshots with personal/security data redacted.

**Stop conditions:** stop and report without accepting or mutating anything if the identity is not already provisioned, the legal entity is not exactly Crowdler AB, the account lands on a personal team, Apple presents an attestation/agreement, the requested least-privilege scope is unavailable, a duplicate identity exists, or any fee is requested.

**Deadline/cost/attestation:** no launch date is claimed; complete before authorizing the first iOS credential or build operation. Expected discovery cost is **SEK 0** if Crowdler AB already has active membership and the dedicated identity already has access. Any enrollment, renewal, invitation, acceptance, or presented terms require a separate explicit approval.

**What this unblocks:** choosing a non-colliding build number and preparing separate, exact approvals for bundle capability/signing, Clerk Sign in with Apple configuration, and the first iOS build. It does not authorize any of those later actions.

**Separate future invitation/acceptance packet (not authorized here):** if the dedicated identity is not provisioned, request explicit approval naming inviter, invitee, exact Crowdler AB Team ID/legal entity, proposed Developer or app-scoped App Manager role, app scope, cost, any terms/attestation, and stop conditions. Invitation issuance and acceptance are mutations and must not be described as read-only discovery.

## Build and binary acceptance

Before upload, reconcile build number `1` against the correct Crowdler AB App Store Connect record, then freeze the commit and record EAS build ID, source SHA, version/build, archive/IPA SHA-256, builder image, and dependency lock hash. Run EAS only from `apps/mobile` with the `ios-production` profile; that profile deliberately disables auto-increment so the frozen source and archive cannot silently diverge. Inspect the IPA for:

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

## Local source-readiness receipt — 2026-08-15

- The dedicated iOS worktree was clean before reconciliation and merged fetched `origin/main` `695f76e35c137ed5b38e3a1dc18ed96405b3c5ba`; the dirty canonical checkout was not modified or cleaned.
- Exact source/config preparation commit verified below: `5457d59cb14543e8d28687ded5fb02994471e9e6`. This is not the approval-gated release freeze because Apple identity and build-number reconciliation remain blocked.
- Full canonical test suite at that commit after the final merge and auth-error hardening: 752/752 passed.
- Full lint: passed with zero errors and four pre-existing warnings.
- Full Next production build: passed and generated all 88 static pages.
- `expo-doctor --verbose`: 18/18 checks passed.
- Mobile TypeScript check: passed.
- Focused iOS release-profile, social-authentication, and account-deletion tests: 19/19 passed. Social-provider failures now show a stable user-safe support message instead of raw provider exception text; Apple-sheet cancellation remains silent.
- A fresh native `expo prebuild --platform ios --no-install` succeeded. Generated source produced bundle `com.sidequestchess.app`, version/build `0.1.349 (1)`, URL schemes `sidequestchess` and `com.sidequestchess.app`, Sign in with Apple entitlement `Default`, `ITSAppUsesNonExemptEncryption = false`, iPhone/iPad device families, iOS deployment target 15.1, iPhone portrait orientations, and all four iPad orientations. No app-owned `PrivacyInfo.xcprivacy` was generated at this no-Pods stage; embedded SDK manifests and required-reason API declarations remain an archive/Pods inspection gate.
- EAS CLI configuration resolution from `apps/mobile` validated the `ios-production` store profile with local app-version source, build `1`, production API/Clerk environment, and `autoIncrement: false`. This read-only check did not request Apple credentials or start a build.
- A fresh local iOS JavaScript export completed: 854 modules bundled into a 3,708,246-byte Hermes bytecode file; export directory size 53 MB; bytecode SHA-256 `3e65fc554ce9ab11679b40f43538f4d9f8477c2f8f6715cad13a1a14ac8f2207`. This is not a native archive or IPA.
- App Store draft field lengths are within current limits: subtitle 22 characters, keywords 85 UTF-8 bytes, promotional text 164 characters.
- Lockfile SHA-256 after reconciliation: `35f1e3fa53d7b0f7652929b4f9217586e9a46174ae502d500cb7645ad392af15`.
- The current EAS CLI is available through an ephemeral `npx eas-cli` invocation (`eas-cli/22.0.0`); no global/direct `eas` executable was found on the active PATH. Read-only EAS config resolution succeeded, but no build, credential, or submit command was run.
- Local Apple toolchain remains blocked: selected developer directory is Command Line Tools, `xcodebuild` requires full Xcode, and zero valid code-signing identities are installed.
- Operator-observed EAS status before this packet identified Andreas's personal session; source configuration independently names Expo owner `and72nor`. That personal identity is prohibited for new Apple operational access or credentials. No EAS build, credential, submit, App Store Connect, or Apple account mutation was attempted.
- This is source/config evidence only. No archive, IPA, signing, TestFlight, real-device, screenshot, review, or storefront claim is implied.
