# Side Quest Chess iOS release packet — updated 2026-08-20

Status: source-preparation packet only. It is not evidence of an Apple build, TestFlight delivery, App Review submission, or public release.

## Candidate reconciled from `origin/main`

- Reconciled `origin/main` baseline: `c094acf063de716d649e032ffb9890d0058443cb` (fetched and merged 2026-08-20). Working-branch reconciliation merge: `5deae7b94a918bfb202de9ff4bea462a46ba8f41`. The candidate remains unfrozen.
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
| Privacy labels | DRAFT ONLY | Binary/SDK inspection, deployment of the candidate policy disclosure for safety reports/blocks, and adopted App Store Connect answers |
| Current screenshots | BLOCKED | Captures from the exact TestFlight candidate on required Apple display sizes |
| TestFlight real-iPhone smoke | BLOCKED | Store-delivered install and signed-in checklist receipt |
| iPad acceptance | BLOCKED | Responsive matrix and exact-candidate screenshots, or approved source change disabling tablet support |
| Review account and deletion path | PARTIAL | Disposable reviewer account; exact-candidate disclosure that already-shared self-contained proof links may remain accessible; successful email/password and Apple-created account deletion on TestFlight; and evidence that Sign in with Apple authorization tokens are revoked during deletion, either by exact-candidate implementation or documented and verified Clerk behavior |
| UGC safety and content rights | BLOCKED | Exact-candidate filtering/reporting/blocking verification across Community Solo and Multiplayer; a centralized, operator-accessible moderation queue with alerting, triage/audit handling, and retention independent of reporter-account deletion; published contact path; and owner/legal evidence that Lichess/Chess.com access and displayed material are authorized. Current content/creator reports are stored only in the reporter's Clerk private metadata and no moderation consumer is present in source, so the UI's “We'll review” promise is not operationally supported. |
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
| Content rights | Yes, the app accesses third-party public chess records; owner/legal must verify applicable Lichess and Chess.com API/terms compliance, public-record use, displayed names/marks, and retain review-ready authorization evidence before attesting |
| Territories | Worldwide target; owner/legal must resolve any storefront-specific game authorization requirement before selecting affected territories |
| Release method | Manual release recommended; App Review submission and public release require separate approvals |
| License agreement | Standard Apple agreement recommended; any custom agreement requires owner/legal approval |
| Review contact | First name, last name, reachable phone, and email remain owner-supplied fields |

### App Store Connect completion receipt

Before submission, preserve one dated receipt proving completion of every applicable field below against the exact selected build. No draft elsewhere in this packet is an adopted App Store Connect answer.

1. Correct legal team, bundle ID, Apple app ID, SKU, primary locale, and duplicate-search result.
2. Version record and exact selected build identity.
3. Name, subtitle, categories, copyright, description, keywords, promotional text, and URLs.
4. Current screenshots for every enabled device family and adopted locale.
5. App Privacy answers and User Privacy Choices URL.
6. Full age-rating questionnaire, Apple-calculated rating, and any 13+ or regional override.
7. Content-rights attestation and retained supporting evidence.
8. Export-compliance/encryption answers and any requested documentation.
9. Advertising identifier and tracking declarations.
10. Review contact name, phone, email, demo credentials, notes, fixture/reset instructions, and attachments.
11. Price, territories, release method, and phased-release choice.
12. Accessibility Nutrition Label decision based on exact-candidate evidence.
13. DSA trader/account-level status and any territory-specific game requirements.

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
- Report Community Multiplayer content and creators, block Community Multiplayer creators, and contact support about Community Solo content
- Permanently delete your account in the app

Side Quest Chess never asks for your Lichess or Chess.com password and is independent from Lichess and Chess.com. There are no ads, in-app purchases, subscriptions, or real-money prizes. Intended for ages 13 and older.

### Internal first-version summary

Use this in review context if requested; do not assume App Store Connect exposes release notes for version 1.0. Refresh Android status immediately before use and do not submit while Android remains private. First iOS release. Side Quest Chess follows the public web and Android products with Solo, Custom, Community, and Multiplayer Side Quests; public-game proof checks; account sync; Trophy Cabinet; support; Community Multiplayer reporting/blocking; a Community Solo support-report handoff; and in-app account deletion.

## Age-rating draft

Owner must adopt the answers in App Store Connect after checking the current questionnaire wording. Product-fact draft:

- Gambling, simulated gambling, sweepstakes, loot boxes, and real-money prizes: none. **Contests: Yes** under Apple's broad current definition because users compete for rankings, goals, and podium/trophy outcomes, even though there are no prizes.
- In-app purchases and advertising: none
- Publisher-authored sexual content, nudity, alcohol, tobacco, drugs, horror, profanity, violence, and medical content: none
- User-generated content: yes — profile names/bios, custom/community quest text, multiplayer text, and support messages. Answer every frequency/content question for the entire reachable UGC experience rather than treating publisher-authored content as the whole app. Community Multiplayer has native content/creator reporting and blocking; Community Solo currently uses a support-report handoff and does not expose an equivalent adjacent native block control. No objectionable-text filter is currently verified, so do not answer mature-content frequency as None or claim Guideline 1.2 readiness until that gap is closed and tested.
- Unrestricted web access: no general browser; the app opens specific legal/support pages and public proof/share destinations
- Messaging/chat: **Yes under Apple's current questionnaire definition**, which includes public posting, even though there is no direct or real-time user-to-user chat
- Social media: **Yes** because Community discovery, public posting, likes, profiles, and creator attribution are reachable
- Location sharing: none
- Social media disabled for users under 13: no; in-app age assurance: no
- Product distribution posture: intended for ages 13 and older. Record Apple's calculated rating from the then-current questionnaire and apply an age-rating override to at least 13+ if Apple calculates lower, so the store rating does not contradict the Terms minimum age.

Capability-answer draft to map field-by-field onto the live dated questionnaire: user-generated content **Yes**; social media **Yes**; messaging/chat **Yes** under the public-posting definition; contests **Yes**; unrestricted web access **No**; advertising **No**; in-app purchases **No**; loot boxes **No**; gambling/simulated gambling/real-money gaming **No**; sweepstakes **No**; location sharing **No**; parental controls **No**; social media disabled for users under 13 **No**; age-assurance mechanism inside the app **No**; publisher-authored mature-content descriptors listed above **None**. Do not adopt reporting/filtering/blocking answers more broadly than the exact tested surfaces. Record the exact questionnaire version/date, every displayed question and selected frequency, Apple-calculated rating, 13+ minimum override if needed, and any regional override before adoption. UGC frequency/exposure cannot be safely preselected while arbitrary public text lacks a verified filter.

## App Privacy draft

Tracking: **No**, provided binary and provider review confirms no SDK performs cross-company tracking. No data is used for third-party advertising, developer advertising, or sale to data brokers.

Conservative per-type draft. All listed rows are **collected**, **linked to the user**, and **not used for tracking** unless final provider/binary inspection proves otherwise:

| Apple category / type | Purpose(s) | Source and behavior to reconcile |
| --- | --- | --- |
| Contact Info / Name | App Functionality | Clerk account and runner display name |
| Contact Info / Email Address | App Functionality | Email/password or Apple/Google/Facebook provider identity; Apple private-relay addresses are possible |
| Identifiers / User ID | App Functionality | Clerk user/session identity and application records |
| User Content / Photos or Videos | App Functionality | Profile image supplied by Clerk or the selected sign-in provider; no native photo-library access is requested |
| User Content / Customer Support | App Functionality | Signed-in support messages and any user-approved diagnostics included with them |
| User Content / Gameplay Content | App Functionality | Quest saves/state, proof attempts and receipts, game IDs, Multiplayer participation/standings, and saved custom quests |
| User Content / Other User Content | App Functionality | Profile text, public chess usernames, custom/community free text, Multiplayer text, reports, blocks, report-target identifiers, and timestamps |
| Diagnostics / Other Diagnostic Data | App Functionality | Optional support bundle: app build/version, package, platform/device, API destination, connected chess usernames, active quest, and Multiplayer counts; default off and previewed before send |

The mobile source does not currently establish mobile-origin Product Interaction collection for Analytics; do not declare that type/purpose merely because the combined web/mobile policy describes first-party web analytics. Add it only if exact-IPA network/provider inspection proves it. Display names, usernames, provider profile images, standings, Community content, and proof details may be publicly visible by product design. Clerk and the selected Apple, Google, Facebook, or email/password sign-in path process authentication data; hosting and chess-record providers process the data described by the public policy. Current reports and blocks are stored in the reporter's Clerk private metadata and are therefore account-linked; source commit `f615820c368bf70a44038ab99a3ccab1dfcda0ac` adds an explicit policy disclosure, but that disclosure is not public until the branch lands and the web policy is deployed. Account deletion removes account-attached identity/profile/progress after required cleanup, subject to security, legal, fraud-prevention, backup, and de-identified/aggregate exceptions stated in the adopted policy. Do not declare crash data, performance data, device ID, location, contacts, purchases, browsing/search history, or sensitive information until the exact IPA, Clerk, Expo, React Native, and embedded privacy manifests have been inspected. The optional support bundle is collected when sent despite being opt-in. Adopted answers must match `https://sidequestchess.com/privacy`, provider contracts, retention behavior, and the production binary. Supply `https://sidequestchess.com/privacy#choices` as the optional User Privacy Choices URL after confirming that anchor remains live.

Account deletion wording: My Account → Delete account permanently removes the sign-in identity and account-attached profile, saved progress and proof receipts, custom Side Quests, report, and block data after replicated Multiplayer references are cleaned. Current report/block records are not independently retained after the reporting or blocking account is deleted. Already-shared public proof URLs use self-contained signed payloads and may remain accessible after account deletion; the source now discloses this limitation at the deletion control and in the privacy policy, and the adopted review wording must do the same unless revocation is implemented. A cleanup failure must preserve the sign-in identity and return an error. For accounts created with Sign in with Apple, deletion readiness additionally requires verified Apple-token revocation; Clerk identity deletion alone must not be assumed to prove it.

## Review information draft

- Organization: Crowdler AB
- Review contact: owner must provide an authorized person's name and reachable phone
- Contact email candidate: `sam@crowdler.com` (owner must confirm). The signed-out Support form is source-configured to open this same Crowdler address; exact public deployment and inbox monitoring remain submission gates.
- Credentials: create owner-authorized disposable primary, secondary, and deletion-only review accounts; enter credentials only in App Store Connect and keep them active, non-expiring, and MFA-free (or provide a deterministic review-safe bypass) for the entire review window
- Primary account: verified email/password, deterministic seeded Solo/Custom/Trophy state, and a valid non-personal public Lichess or Chess.com username
- Secondary account: deterministic Multiplayer participant; use a separate deletion-only account if deletion must be exercised
- Record exact fixture IDs, expected proof result, reset instructions/owner, fallback route, and reachable review contact before submission; keep backend services and provider fixtures live for the entire review window

### Paste-ready review notes

**Do not paste this note while Android remains private. After verified Android public storefront availability, update and use:** “Side Quest Chess began as a web product. Android is publicly available; this submission is the first iOS release of the same product.”

The app lets users choose playful chess challenges and verify eligible results against public game records from Lichess or Chess.com usernames supplied by the user. Side Quest Chess does not request or store Lichess or Chess.com passwords and is independent from those services.

Public Side Quests can be browsed while signed out. Sign-in is required to save progress, check proof, create or join account-backed quests, send support messages, use Community safety controls, and manage or delete an account. Community Multiplayer provides native report/block controls; Community Solo currently provides a support-report handoff.

Suggested review flow: browse Solo and Multiplayer while signed out; sign in under My Account; inspect the connected public chess username; open the seeded Solo Side Quest and its proof controls/receipt; inspect the seeded Custom Side Quest and deterministic Multiplayer fixture using the supplied second account; open a Community Multiplayer Side Quest and inspect content report, creator report, and block controls; open a Community Solo Side Quest and inspect its support-report handoff; open Trophy Cabinet; preview support diagnostics (off by default); and verify Privacy Policy, Support, Terms, and My Account → Delete account. Reports, blocks, likes, support submission, quest mutation, and deletion mutate shared state. Use the separate deletion-only account for deletion: My Account → Delete account requires typing `DELETE MY ACCOUNT`, then deletes replicated account data before deleting the Clerk identity; cleanup failure preserves the identity and shows an error. Review credentials, fixture IDs, expected results, reset instructions, and fallback routes must be completed in App Store Connect before submission.

The app has no advertising, in-app purchases, subscriptions, gambling, or real-money prizes. It is intended for users aged 13 and older. Sign in with Apple uses Apple's native sheet through Clerk. Google and Facebook use the expected OAuth callback `sidequestchess://sso-callback`.

## Screenshot and preview plan

Capture only from the exact binary selected for App Review, with production-like non-personal data and no debug overlays. Supply 1–10 JPEG/JPG/PNG screenshots with no alpha per adopted device/locale set. Confirm the live form at capture time; current principal sets are the 6.9-inch iPhone and, while tablet support remains enabled, the 13-inch iPad.

Required device families while `supportsTablet` remains true:

- 6.9-inch iPhone set, portrait
- 13-inch iPad set, using the orientation that truthfully represents the app; both portrait and landscape sets are not mandatory
- Initial recommendation: English only. Description and keywords require locale-specific copy when more locales are added; screenshots may default from the primary locale unless deliberately localized.

Suggested ordered frames: Home/active Side Quest; Solo catalog; quest detail and proof receipt; Multiplayer discovery/detail; Trophy Cabinet; Custom Side Quest builder. Avoid login forms, deletion confirmations, support threads, empty/error states, third-party trademarks as the focal claim, and real user data. App previews are optional; do not prepare one unless current-candidate interaction footage materially improves the listing.

Maintain a screenshot manifest with App Store version/build, source SHA, TestFlight/build ID, device/display class, OS, orientation, locale, account/fixture state, caption, filename, exact dimensions, and SHA-256 for every frame. Acceptance checks: no clipping or safe-area overlap; no keyboard/modal residue; consistent status bar; baseline and larger Dynamic Type legibility; no personal identifiers, invite codes, stale Android/GitHub labels, or debug data; and truthful earned/locked trophy and proof states.

Inspect the exact archive's App Store icon set and rendered device icons: verify a 1024×1024 marketing icon with no alpha, all required generated sizes, no clipping or safe-zone defect, correct Side Quest Chess branding, and documented asset provenance.

Complete App Store Connect's Accessibility Nutrition Label decision from exact-candidate evidence. Do not claim VoiceOver, Larger Text, sufficient contrast, reduced motion, or other accessibility support until the corresponding matrix passes.

## Same-candidate responsive QA matrix

Run clean install and update install from the exact TestFlight build on physical iPhone and physical iPad. Cover the latest OS and the oldest supported deployment target where practical. Record device, OS, TestFlight build, source SHA, orientation/window size, tester, timestamp, and result.

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
6. Exercise Custom create/edit/start/check/reset, including objectionable-text rejection once implemented; exercise Community Solo detail/share/report-support handoff.
7. Exercise Multiplayer create/share/join with a second account, refresh, proof, leave, content report, creator report, and block. Confirm blocked creators/content disappear from both Solo and Multiplayer discovery.
8. Verify Trophy Cabinet, signed-in support message, diagnostics default-off and opt-in behavior.
9. Test offline launch/reconnect, background/foreground, forced termination/relaunch, keyboard, rotation, VoiceOver, and Dynamic Type.
10. Delete disposable email/password and Apple-created accounts in-app; confirm signed-out relaunch, server/identity cleanup, and Sign in with Apple authorization-token revocation evidence. Separately induce/verify a cleanup failure in a non-production fixture and confirm the Clerk identity is preserved.
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
6. Treat App Store Connect API access as a separate authorization. The Account Holder alone can request access, and team-key creation remains approval-gated. If a team key is approved, assign only the minimum role but recognize that team keys apply across all apps. App-level restriction requires an approved individual key inheriting an app-scoped user's access. Keep all private keys outside the repository, record issuer/key IDs in the approved secret manager, and revoke unused keys.
7. Record inviter, invitee, role, app scope, Team ID, date, review date, and revocation owner.

This packet does not authorize an invite, acceptance, credential generation, app-record mutation, or upload.

### Owner authorization packets — discovery and mutation are separate

Discovery authorization: authorize Sam, acting only through a dedicated Crowdler-controlled operational Apple Account, to perform the read-only checks listed below without mutations, and only if that identity is already provisioned on the correct Crowdler AB team. Do not send passwords, recovery codes, private keys, certificates, or review credentials.

**Why:** source preparation cannot verify the fail-closed legal-team, duplicate bundle/app identity, and least-privilege operator gates without read access to the correct Crowdler AB Apple Developer and App Store Connect context.

**Requested Apple authorization (no mutation):** using only an already provisioned dedicated Crowdler/Sam identity, authorize read-only discovery of Team ID/membership status, existing bundle ID `com.sidequestchess.app`, existing Side Quest Chess App Store Connect records/SKUs, and highest existing iOS build number. Do **not** authorize an invitation or acceptance, enrollment, payment, agreements, tax/banking, Admin/Finance/Legal access, app-record creation or edits, certificate/profile/key generation, Sign in with Apple configuration, Apple credential access, builds, uploads, testers, metadata adoption, submission, or release.

**Return receipt required:** legal entity, Team ID, membership expiry/status, dedicated operator address, existing role and app scope, duplicate-search results for bundle ID and app name, any existing app-record ID/SKU/bundle association, highest existing iOS build number, and screenshots with personal/security data redacted.

**Stop conditions:** stop and report without accepting or mutating anything if the identity is not already provisioned, the legal entity is not exactly Crowdler AB, the account lands on a personal team, Apple presents an attestation/agreement, the requested least-privilege scope is unavailable, a duplicate identity exists, or any fee is requested.

**Deadline/cost/attestation:** no launch date is claimed; complete before authorizing the first iOS credential or build operation. Expected discovery cost is **SEK 0** if Crowdler AB already has active membership and the dedicated identity already has access. Any enrollment, renewal, invitation, acceptance, or presented terms require a separate explicit approval.

**What this unblocks:** choosing a non-colliding build number and preparing separate, exact approvals for bundle capability/signing, Clerk Sign in with Apple configuration, and the first iOS build. It does not authorize any of those later actions.

**Separate future invitation/acceptance packet (not authorized here):** if the dedicated identity is not provisioned, request explicit approval naming inviter, invitee, exact Crowdler AB Team ID/legal entity, proposed Developer or app-scoped App Manager role, app scope, cost, any terms/attestation, and stop conditions. Invitation issuance and acceptance are mutations and must not be described as read-only discovery.

**Separate Expo authorization packet (not authorized here):** Apple access does not grant Expo access. For owner `and72nor` and project `9af73cb2-dcd5-4429-b194-67fc81206937`, request an explicit least-privilege Expo organization invitation or owner-approved project transfer for the dedicated Crowdler operator, naming inviter, invitee, scope, cost, any terms, and revocation owner. Do not use Andreas's personal EAS session for Apple credentials or the iOS build.

## Build and binary acceptance

Before upload, reconcile build number `1` against the correct Crowdler AB App Store Connect record, then freeze the commit and record EAS build ID, source SHA, version/build, archive/IPA SHA-256, builder image, and dependency lock hash. Run EAS only from `apps/mobile` with the `ios-production` profile; that profile deliberately disables auto-increment so the frozen source and archive cannot silently diverge. Inspect the IPA for:

- `CFBundleIdentifier = com.sidequestchess.app`
- `CFBundleDisplayName = Side Quest Chess`
- expected version and unique build number
- `sidequestchess` URL scheme
- production API/configuration and no development server references
- distribution signature and Crowdler AB team
- only intended entitlements
- `ITSAppUsesNonExemptEncryption = false` remains accurate for the exact IPA; App Store Connect's export-compliance questionnaire is completed consistently, any requested documentation is attached, and the adopted-answer receipt is preserved
- embedded privacy manifests and SDK signatures
- no sensitive usage descriptions or permissions absent a feature and adopted privacy disclosure
- no unexpected advertising, tracking, purchase, location, camera, microphone, photo, contact, or biometric SDK/capability

Submission, App Review acceptance, release approval, and public storefront availability are four distinct states and must be reported separately.

## Local source-readiness receipt — 2026-08-20

- The dedicated iOS worktree was clean before reconciliation and merged fetched `origin/main` `c094acf063de716d649e032ffb9890d0058443cb` as `5deae7b94a918bfb202de9ff4bea462a46ba8f41`; the dirty canonical checkout was not modified or cleaned. The candidate remains unfrozen.
- Source commit `f615820c368bf70a44038ab99a3ccab1dfcda0ac` discloses account-linked safety-report/block data in the source privacy policy and adds a regression assertion. The disclosure is not public until the branch lands and the web policy is deployed; no deployment was attempted.
- Fresh full canonical suite after reconciliation and the deletion/support corrections: 761/761 passed.
- Fresh full lint: passed with zero errors and four pre-existing warnings.
- Fresh full Next production build: passed and generated all 88 static pages.
- Fresh mobile TypeScript check: passed. `expo-doctor --verbose`: 17/18 checks passed; the sole failure is a current Expo SDK patch mismatch (`expo` expected `~54.0.37`, found `54.0.36`). This remains a source-readiness blocker rather than being waived or silently upgraded; a trial update introduced broader lockfile churn and a duplicate native `expo-constants`, so it was fully reverted pending a separately reviewed dependency update.
- Fresh focused iOS release-profile, social-authentication, account-deletion, and privacy-policy tests: 28/28 passed.
- Fresh production dependency audit reconfirmed no critical advisories and only the two narrowly accepted, unpatched Expo/Metro build-tool `image-size` high advisories; the focused release-policy test confirms that exact allowlist.
- Fresh Expo iOS introspection resolved name `Side Quest Chess`, bundle `com.sidequestchess.app`, version/build `0.1.349 (1)`, schemes `sidequestchess` and `com.sidequestchess.app`, `supportsTablet: true`, Sign in with Apple entitlement `Default`, `ITSAppUsesNonExemptEncryption = false`, ATS arbitrary loads disabled, iPhone portrait orientations, and all four iPad orientations.
- The prior native `expo prebuild --platform ios --no-install`, local iOS JavaScript export, and EAS local-config receipt were produced from source/config commit `5457d59cb14543e8d28687ded5fb02994471e9e6`. Mobile source has changed since that receipt, so those artifacts are historical only and must be regenerated from the eventual frozen commit after the Expo dependency mismatch is resolved.
- That prior no-Pods prebuild generated no app-owned `PrivacyInfo.xcprivacy`; embedded SDK manifests, SDK signatures, and required-reason API declarations remain an archive/Pods inspection gate.
- App Store draft field lengths are within current limits: subtitle 22 characters, keywords 85 UTF-8 bytes, promotional text 164 characters.
- A focused App Store packet contract test now binds the Expo identity and standing product facts, enforces the 30-character name/subtitle and 100-byte keyword limits, rejects public `SQC` in listing copy, requires the listing/privacy/review/QA/access/binary sections, and keeps archive, TestFlight, review, and public-release evidence fail-closed.
- The source marketing icon is 1024×1024 with no alpha; exact-archive generated icon-set inspection remains required.
- Current lockfile SHA-256: `35f1e3fa53d7b0f7652929b4f9217586e9a46174ae502d500cb7645ad392af15`.
- Local Apple toolchain remains blocked: selected developer directory is Command Line Tools, full Xcode is unavailable, and zero valid code-signing identities are installed.
- Independent source review confirmed that Community Multiplayer content/creator reports are written only to the reporter's Clerk private metadata (`src/app/api/reports/content/route.ts` and `src/app/api/reports/creators/route.ts`), with no repository consumer or centralized moderation queue. This is a newly explicit fail-closed App Review gate, not verified moderation readiness.
- Independent source review found that deletion copy overstated deletion of already-shared self-contained proof links and that the signed-out Support form exposed Andreas's personal Gmail address. The branch now truthfully discloses shared-link persistence in mobile/web deletion controls and the privacy policy, aligns signed-out support mail with `sam@crowdler.com`, and adds regression coverage. These source changes are not public until authorized merge/deployment; inbox ownership and monitoring still require verification.
- Operator-observed EAS status before this packet identified Andreas's personal session; source configuration independently names Expo owner `and72nor`. That personal identity is prohibited for new Apple operational access or credentials. No EAS build, credential, submit, App Store Connect, or Apple account mutation was attempted.
- This is source/config evidence only. No archive, IPA, signing, TestFlight, real-device, screenshot, review, or storefront claim is implied.
