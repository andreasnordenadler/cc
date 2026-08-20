# Side Quest Chess — iOS App Store Release Packet

**Prepared:** 2026-08-16
**Source baseline:** `ff034ca9a93b5306f57d88431ffdfda7385b58f3` (`origin/main` when this lane began)
**Reconciled through:** `5cc23d7c2097dbb90489373630e07080d25af2cb` (`origin/main` fetched 2026-08-20)
**Status:** preparation only — **not** an App Store Connect record, Apple credential, IPA, TestFlight build, or submission.

### Current launch-order snapshot

- Web is publicly available at `https://sidequestchess.com`.
- Android `0.1.349` / version code `350` has been accepted and physically approved in Google Play **Internal testing**. Android production/public rollout is not verified and must not be described as launched.
- iOS preparation may continue, but there is still no verified signed archive, TestFlight build or installation, App Store review submission, or public iOS release.
- This branch is an isolated preparation lane. Its head is not a frozen release candidate and nothing in this packet authorizes merge, deployment, account mutation, upload, submission, or release.

## 1. Non-negotiable release gates

Do not treat any of the following as complete until evidence is attached to the frozen candidate:

1. Crowdler AB is the correct legal seller/controller, and a dedicated Crowdler/Sam operational Apple identity has the required access. Do not use Andreas's personal identity.
2. `com.sidequestchess.app` is reconciled in Certificates, Identifiers & Profiles and App Store Connect; there is no duplicate or conflicting app record.
3. The source commit is frozen. The IPA's bundle ID, version, build number, signing team, entitlements, and privacy manifests are inspected from the produced archive.
4. `sidequestchess://sso-callback` works for production Clerk Google/Facebook flows on a physical iPhone, including cold launch, cancel, and return from browser. Determine whether Sign in with Apple is required before submission.
5. Privacy answers match actual app, backend, Clerk, and all shipped transitive SDK behavior.
6. Fresh screenshots are captured from this candidate (not web or old Android images), including iPad while `ios.supportsTablet` remains `true`.
7. The exact TestFlight build installs and completes signed-out and signed-in smoke on a real iPhone; iPad validation is required if tablet support remains enabled.
8. Review account and deletion path is verified: signed in → My Account → Delete account → confirm → app signs out; review notes identify this path and a reviewer test account if one is needed.
9. TestFlight upload, review submission, and public availability are separately approved states.

## 2. Current technical facts and exact build checks

| Item | Current source evidence | Required before the next gate |
| --- | --- | --- |
| Display name | `Side Quest Chess` | Keep this exact public name; never substitute “SQC”. |
| Bundle ID | `com.sidequestchess.app` | Verify it in the Apple team and generated IPA. |
| Scheme / auth callback | `sidequestchess`, `sidequestchess://sso-callback` | Inspect `CFBundleURLTypes`; exercise real iOS OAuth. |
| iPad | `supportsTablet: true`, portrait | Run iPhone/iPad responsive matrix or disable tablet support in a separately approved candidate decision. |
| Native project | Managed Expo / no checked-in `ios/` directory | Generate/archive and inspect the exact generated native project. |
| SDK surface | Expo 54, Clerk, AuthSession/WebBrowser, SecureStore, Clipboard, Application, DateTimePicker | Inventory generated permissions, entitlements, privacy manifests, required-reason APIs, and all transitive pods. |
| Network/auth | Production `https://sidequestchess.com`, Clerk production public key | Inspect only the frozen production build; do not assume package metadata proves server behavior. |
| Encryption | HTTPS/auth/SecureStore libraries are present | Complete Apple's export-compliance questionnaire against the archive; do not set `ITSAppUsesNonExemptEncryption` based on assumption. |
| iOS versioning | Expo version `0.1.349`; no source-controlled `ios.buildNumber` | Add and verify a deliberate build number before freezing the candidate; do not infer it from Android code `350`. |
| Apple login | Google and Facebook OAuth exist; Sign in with Apple is absent | Implement and verify Sign in with Apple, or obtain a documented Guideline 4.8 exception before review. |
| Privacy manifest | No app-owned `PrivacyInfo.xcprivacy` or Expo `ios.privacyManifests` entry is present | Inspect the generated archive and every bundled SDK, then add only evidence-backed required-reason declarations. |
| Shared-link routing | The OAuth callback scheme is configured; universal-link/associated-domain routing is not | OAuth callback smoke is mandatory. Treat public quest/proof/invite links as web links unless native routing is deliberately implemented and tested. |

### Safe source correction in this lane

The shared mobile report/block API now sends platform-neutral `X-Side-Quest-Chess-Client: mobile`; the server preserves mobile provenance for both this candidate and older Android clients that identify as `android`. Support diagnostics now identify the installed app by runtime bundle ID and native build rather than calling every installed build a GitHub Android APK.

The matching server routes must be deployed before distributing a candidate that sends the new `mobile` header. Against an older backend, safety requests still complete but can be recorded with website provenance. Deployment remains separately approval-gated; this packet does not authorize it.

## 3. App Store listing draft (English, en-US)

**Name:** Side Quest Chess

**Subtitle:** Turn chess games into quests

**Promotional text (optional):** Pick a Side Quest, play your public chess games, and come back for a verified result.

**Description:**

> Side Quest Chess turns the games you already play into memorable chess challenges.
>
> Choose a Side Quest, connect the public chess username you want to use, then play on Lichess or Chess.com. Return to Side Quest Chess to check the result and keep a clear record of your completed quests.
>
> • Pick solo Side Quests built around real chess goals
> • Check public-game proof and see what happened
> • Create and join multiplayer Side Quests with other players
> • Explore community Side Quests, with reporting and blocking controls
> • Keep your chess usernames and account controls in one place
>
> Side Quest Chess does not ask for or store your Lichess or Chess.com passwords. It has no ads, in-app purchases, or real-money prizes.
>
> Need help? Visit https://sidequestchess.com/support
> Privacy: https://sidequestchess.com/privacy
> Terms: https://sidequestchess.com/terms

**Keywords draft (validate character count in App Store Connect):**
`chess,challenge,quests,board,strategy,lichess,chesscom,multiplayer`

**Primary category:** Games — Board
**Secondary category:** Games — Strategy

**Copyright:** `© 2026 Crowdler AB` (confirm legal year/name before entry.)

**Support URL:** `https://sidequestchess.com/support`
**Privacy policy URL:** `https://sidequestchess.com/privacy`
**Marketing URL (only after confirming the home page is suitable):** `https://sidequestchess.com`

## 4. Age rating and content answers — draft only

The Apple account holder must complete the current questionnaire from the frozen product behavior; Apple calculates the final regional ratings. Do not promise 13+ until the questionnaire result is reviewed.

Preliminary evidence-led answers to verify:

- No advertising.
- No in-app purchases.
- No real-money gambling or prizes.
- No loot boxes or simulated gambling.
- No sexual content, nudity, drugs/alcohol/tobacco references, horror/fear themes, or graphic violence in the app-provided content.
- Community/multiplayer content, profile text, public chess usernames, reporting, blocking, and possible social interaction exist. Answer all user-generated content, messaging/social, moderation, unrestricted-web-access, and contest questions from actual behavior.
- Because Google and Facebook are offered as primary-account sign-in, ship Sign in with Apple or document a reviewed App Review Guideline 4.8 exception that satisfies every equivalent-login criterion. There is no current Apple OAuth implementation.
- Review "Contests" closely: ranked events, leaderboards, achievement rewards, or server-operated competitions may affect the answer even without money prizes.
- Record whether under-13 social restrictions, parental controls, or age assurance exist; do not infer them from the desired audience.

## 5. App Privacy nutrition-label draft

This is a data-map work item, **not** a declaration. Confirm each item with Crowdler's backend-retention owner and Clerk/vendor documentation before entry.

| Likely data type | Examples to verify | Likely purpose | Linked? | Tracking? |
| --- | --- | --- | --- | --- |
| Contact / identifiers | Clerk account identity; email/name only if received or retained | account management, app functionality, security | likely | no known tracking; verify vendors |
| User content | profile/bio, chess usernames, quest/proof records, community/multiplayer content, reports/blocks, support notes | app functionality, moderation, support | likely | no known tracking; verify |
| Usage / gameplay | product interaction: page views, quest/community actions, paths or quest/game identifiers, event times, device category, signed-in event totals/recent history | app functionality, product operation | verify retention | no known tracking; verify |
| Diagnostics | optional user-consented support details; app/build/platform/API context | customer support | may be linked when submitted | no known tracking; verify |
| Third-party processing | Clerk authentication; public Lichess/Chess.com game/username retrieval | account/functionality | verify vendor roles | verify |

Explicitly investigate whether IP-related information, device identifiers, product interaction, crash reports, or analytics are retained by the app, hosting, Clerk, Expo/EAS, or any library/service in the store build. Do not select “no data collected” unless the production system and every partner satisfy Apple's definition.

## 6. Review notes and reviewer access draft

**Notes for App Review:**

> Side Quest Chess lets players choose solo or multiplayer chess challenges and verify results against public games connected to the player's configured Lichess or Chess.com username. The app does not request or store chess-site passwords.
>
> Account deletion is available in-app: My Account → Delete account → enter the displayed confirmation phrase → Delete account. Deletion signs the user out after the account deletion request succeeds.
>
> Community multiplayer content can be reported, and creators can be reported or blocked from the community safety controls.
>
> Authentication returns to the app through `sidequestchess://sso-callback`. Please test Google/Facebook (and Sign in with Apple if added) with the reviewer account below. [INSERT dedicated reviewer credentials and any exact test data only after approval.]
>
> Support: https://sidequestchess.com/support
> Privacy: https://sidequestchess.com/privacy

Before entering these notes, verify that a dedicated reviewer account is lawful, active, free of personal data, and has enough public test content to exercise the core path. Never put production owner credentials in review notes.

## 7. Screenshot and video plan

Apple currently accepts 1–10 screenshots per device class/localization. Capture only after the TestFlight candidate is frozen.

| Device class | Required capture plan while iPad support is enabled | Candidate screens |
| --- | --- | --- |
| 6.9-inch iPhone | Portrait 1320×2868, 1290×2796, or 1260×2736 px; no alpha | Home/quest selection, active quest/proof, multiplayer discovery, community safety controls, My Account/deletion entry, Help & Support |
| 13-inch iPad | Portrait 2064×2752 or 2048×2732 px; no alpha | Same feature set, demonstrating usable tablet layout |

Use real candidate screens with no fake achievements, pricing, competitor marks, or stale product name. If the actual submitted binary excludes iPad support, re-evaluate screenshot requirements and metadata only after the binary/config decision is frozen.

**App preview:** optional. Do not create one until a stable iPhone capture script and approved public copy exist.

**Localization:** en-US required for the initial listing. Keep text-overlaid screenshot copy in English; translate each full screenshot set and listing field together before adding a locale.

## 8. Same-candidate device QA matrix

| Flow | iPhone (required) | iPad (required while supported) |
| --- | --- | --- |
| Fresh install / launch / offline error | physical device | physical device, Split View/Stage Manager where available |
| Sign-up/sign-in / Google / Facebook / Sign in with Apple if applicable | cold launch, browser return, cancel, resume | same |
| Auth deep link | valid callback, malformed/repeated scheme URL, logout | same |
| Core game product | browse, choose, proof refresh, error states | portrait layout, text scaling, no clipping |
| Multiplayer/community | create/join/leave, report content, report/block creator | same, modal dismissal and keyboard |
| Account/data | chess usernames, support without/with diagnostic consent, legal links | same |
| Deletion | test account deletion and enforced sign-out | same |
| Accessibility | VoiceOver core navigation, labels, focus order, Dynamic Type | same plus split-screen focus/overflow |

Record device model, iOS/iPadOS version, build number, account fixture, result, defect link, and screenshot/video evidence for every pass.

## 9. Least-privilege Apple access packet

**Required owner action — approval-gated:**

1. Confirm Crowdler AB is the Apple Developer Program legal entity and App Store seller; confirm enrollment is active. This can involve contractual acceptance/payment — do not perform it in this lane.
2. Create or designate a dedicated, individually owned Crowdler/Sam Apple ID with MFA and a Crowdler-controlled recovery process. Do not use Andreas's personal Apple identity.
3. Invite that identity only after the legal entity and role plan are confirmed. Recommended staged roles:
   - Apple Developer: access needed for the App ID / certificates / provisioning work, granted only by the authorized team agent.
   - App Store Connect: start with App Manager only if the person must create/configure the app record; otherwise Developer for build handling and Marketing for listing assets. Grant access to this app only once the record exists. Finance, Agreements, Users and Access, and Account Holder roles are not needed for engineering release preparation.
4. An authorized Account Holder/Admin separately confirms that `com.sidequestchess.app` is available and then authorizes any record/credential creation. This is an explicit approval boundary.

**This unblocks:** a Crowdler-owned app record, signing, TestFlight upload, privacy/age/export forms, and later review submission. It does **not** authorize any of those mutations by itself.

## 10. Approval boundaries

Written approval is required before enrollment/payment; legal/tax/banking acceptance; App Store Connect record mutation; invitations/attestations; account-tied signing credential generation; TestFlight upload/testers; review submission; phased/public release; any external communication; or any use of Andreas's personal Apple identity.

## 11. Sources to re-check when account work begins

- Apple screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Apple age ratings: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/
- Apple export compliance: https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/
- Apple App Privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
