# Side Quest Chess — iOS App Store release packet

**Prepared:** 2026-08-16; reconciled 2026-08-21
**Upstream baseline:** `5e99adda9a1632642e2f611f115b6db68064746a`
**Reconciled through:** `5e99adda9a1632642e2f611f115b6db68064746a` (`origin/main`, fetched 2026-08-21)
**Status:** source preparation only. This is not an App Store Connect record, Apple credential, IPA, TestFlight build, review submission, or public release.

## 1. Launch order and evidence posture

- Web is publicly reachable at `https://sidequestchess.com`.
- The required sequence is Android/web before iOS. This lane did not independently read Google Play Console or install the current Play artifact, so it makes no Android approval or public-launch claim.
- Current source declares Expo version `0.1.349` and Android version code `349`. Any separately built code-350 Android artifact is not represented by this checkout and needs its own immutable-source receipt.
- There is no verified signed iOS archive, TestFlight build/install, App Store review submission, or public iOS release.
- This isolated branch is not a frozen release candidate. It authorizes no merge, deployment, account mutation, credential generation, upload, submission, or release.

## 2. Fail-closed release gates

Do not mark any gate complete without evidence tied to the exact frozen candidate.

| Gate | Current state | Required receipt |
| --- | --- | --- |
| Crowdler AB seller/team and dedicated Sam/Crowdler operator | BLOCKED | Legal entity, Team ID, membership status, operator address, role, app scope; never Andreas's personal Apple identity |
| Bundle/App identity | BLOCKED | Apple Developer and App Store Connect lookup for `com.sidequestchess.app`, including duplicate result and any app ID/SKU |
| Expo/EAS custody | BLOCKED | Source still names owner `and72nor` and project `9af73cb2-dcd5-4429-b194-67fc81206937`; approve Crowdler access or transfer before cloud iOS work |
| Source freeze | NOT FROZEN | Approved clean commit, lock hash, source version, deliberate unique iOS build number |
| IPA identity/signing | BLOCKED | IPA hash, bundle/version/build, Crowdler team/signature, entitlements, URL types, SDK list and privacy manifests |
| Authentication/deep link | BLOCKED | Every shipped sign-in method on physical iPhone; production redirect allowlist; cold launch, cancellation and browser return via `sidequestchess://sso-callback` |
| Sign in with Apple / Guideline 4.8 | SOURCE PREPARED; BLOCKED | Native control/config are present, but Crowdler capability/provider configuration, account linking, token revocation and physical-iPhone verification are not |
| Privacy labels | DRAFT ONLY | Backend/retention owner, Clerk/providers, generated archive and transitive SDK behavior reconciled |
| UGC safety/content rights | BLOCKED | Exact report/block/moderation behavior and authorization for public Lichess/Chess.com records and displayed material |
| Worldwide 13+ eligibility | BLOCKED | Owner/legal-approved age-assurance or eligibility flow tested for account creation and every social/UGC surface; a storefront override alone is not access control |
| Deletion/retention truth | BLOCKED | Delete the complete account and associated personal data, including account-associated UGC, or irreversibly anonymize/disclose every legally retained field, basis and exact period |
| Screenshots | BLOCKED | Fresh exact-candidate iPhone and iPad captures while tablet support remains enabled |
| TestFlight iPhone smoke | BLOCKED | Store-delivered exact build, signed-out and signed-in real-iPhone receipts |
| iPad acceptance | BLOCKED | Responsive/device matrix and screenshots, or separately approved removal of tablet support before freeze |
| Review access/deletion | BLOCKED | Disposable account/fixtures and successful exact TestFlight deletion using the literal UI flow |
| Review submission | NOT STARTED | Separate written approval and App Store Connect state receipt |
| Public release | NOT STARTED | Separate written approval and storefront availability receipt |

## 3. Current source facts and build checks

| Item | Current source | Required verification |
| --- | --- | --- |
| Public name | `Side Quest Chess` | Never use “SQC” in public copy |
| Bundle ID | `com.sidequestchess.app` | Apple lookup and archive inspection |
| Scheme/callback | `sidequestchess`; `sidequestchess://sso-callback` | Generated `CFBundleURLTypes` plus device OAuth |
| API | `https://sidequestchess.com` | Frozen production binary/network smoke |
| Tablet | `supportsTablet: true`; portrait Expo orientation; generated iPad orientations must be inspected | Physical iPad portrait, landscape, full-screen and multiwindow QA unless the generated target is deliberately restricted before freeze |
| Native project | Managed Expo; no checked-in `ios/` directory | Generate from frozen source and inspect |
| iOS build number | Not source-controlled | Reconcile highest App Store build, then set a deliberate value |
| Apple login | Native Clerk flow, Expo plugin and iOS capability declaration prepared | Verify Crowdler App ID capability, Clerk provider configuration, account linking/deletion revocation and exact-candidate physical-iPhone behavior |
| Export compliance | Source declares exempt-only encryption with `ios.config.usesNonExemptEncryption: false` | Reconfirm the exact archive contains no proprietary/non-exempt cryptography and inspect `ITSAppUsesNonExemptEncryption = false` before upload |
| App Transport Security | Source explicitly pins arbitrary network loads off with `NSAllowsArbitraryLoads: false` and retains Expo's narrow local-network exception with `NSAllowsLocalNetworking: true` | Inspect the generated and archived `Info.plist`; keep production endpoints HTTPS-only and reject any broader exception unless separately reviewed |
| Universal links | No `ios.associatedDomains` | Treat public quest/proof/invite links as web links |
| Privacy manifest | No app-owned manifest/config entry | Inspect generated project, pods, aggregate privacy report and IPA; verify a privacy manifest for bundled `hermes` and every other Apple-listed SDK before declarations |
| Encryption | HTTPS/auth/SecureStore-related libraries present | Answer Apple's current export questionnaire against the archive; do not infer exemption solely from package names |
| Permissions | No iOS usage descriptions declared in source | Confirm generated `Info.plist` and archive request no unused sensitive access |

Safe source corrections on this branch send platform-neutral `X-Side-Quest-Chess-Client: mobile` for mobile report/block APIs while the server retains compatibility with legacy `android`, make the local preview-account fixture unconditionally development-only, remove personal data from that fixture, and align the signed-out support fallback with `sam@crowdler.com`, the Crowdler controller contact already published in Privacy and Terms. Support diagnostics use runtime application ID and native build. Matching server routes must be deployed before distributing this client. The support correction must also be deployed before distribution; deployment remains separately approval-gated.

Facebook is currently visible whenever Clerk is configured. Before freeze, production Facebook OAuth must pass on the exact iPhone candidate or the control and review copy must be removed. Email/password, Google, Facebook and the source-prepared native Apple control are reachable on their intended platforms; Apple remains unverified until the dedicated Crowdler identity can configure the capability/provider and the exact flow passes on a physical iPhone. The current deletion implementation does not revoke Apple's authorization/tokens: deleting the Clerk user and ending the local session are not sufficient. Keep iOS distribution blocked until a provider-aware revocation path is implemented, tested against Apple and Clerk behavior, and verified during exact-candidate deletion. Review notes must name only methods that pass the final smoke.

## 4. App Store listing draft — English (U.S.)

These are proposed values, not adopted App Store Connect answers.

| Field | Draft value |
| --- | --- |
| Name | Side Quest Chess |
| Subtitle | Turn chess games into quests |
| Primary language | English (U.S.) |
| SKU | `sidequestchess-ios` — immutable; owner must approve before record creation |
| Version | Source candidate `0.1.349`; clean prebuild writes the same short version to `Info.plist`, but the exact archive still controls and must be inspected before approving a version record |
| Primary category | Games |
| Games subcategories | Board; Strategy |
| Secondary category | None proposed; this is a separate optional category field, not the second Games subcategory |
| Price | Free |
| Availability | Worldwide target, excluding any territory whose game-publication evidence is not complete; specifically receipt-gate mainland China ISBN/approval/ICP applicability and the Vietnam game license before selection. The Vietnam storefront age classification is calculated from the age-rating answers rather than supplied as separate classification evidence. Require a South Korea RCN only if the selected build/answers trigger Apple's documented conditions, including a GRAC-issued KR-19 rating, Casino/17+, or the specified Frequent/Intense content thresholds. If GRAC independently issues a rating, App Store Connect permits an optional Korean override to All, 12+, 15+ or 19+ by supplying the RCN with the next version; do not seek or enter an RCN solely for that override. |
| Copyright | 2026 Crowdler AB |
| Privacy Policy URL | https://sidequestchess.com/privacy |
| Support URL | https://sidequestchess.com/support — deployment must expose actual Crowdler AB contact information to signed-out visitors before adoption. Apple expects the Support URL to provide a legal address, monitored email and telephone number as required by local law; the current source supplies the Crowdler email but no verified public address or telephone number, so this remains blocked. |
| Marketing URL | https://sidequestchess.com |
| Terms destination | https://sidequestchess.com/terms |
| Release method | Manual release; review submission and public release remain separate approvals |
| Phased release | Off for version 1 unless separately approved |
| What's New | Not required only if discovery confirms this is version 1; otherwise provide truthful current-candidate release notes before version-record mutation |
| Content rights | Yes — the app accesses third-party public Lichess/Chess.com records; block submission until owner/legal retains the required authorization evidence |
| Advertising identifier | No intended IDFA use; confirm exact IPA/SDK behavior before answering |
| Review contact | Owner-supplied authorized name, reachable phone and monitored Crowdler email; unresolved |
| EU trader status | Crowdler AB is the intended publisher/controller. Before EU availability, an Account Holder or Admin must separately approve and complete the current DSA trader flow: payment account details, certification that offered products/services comply with EU law, email and phone verification, and required supporting documentation. |
| Tax category | An Admin or App Manager may select it; owner selection remains unresolved. If no category is selected, Apple assigns App Store software by default. Do not treat this free/no-IAP app's tax-category choice as a banking gate, and do not accept tax or banking terms without separate approval. |
| License agreement | Standard Apple EULA unless owner/legal separately approves a custom agreement |

**Promotional text:** Pick a Side Quest, play your public chess games, and come back for a checked result.

**Keywords:** `challenge,quests,board,strategy,goals,multiplayer,achievements`

**Description:**

> Side Quest Chess turns the games you already play into memorable chess challenges.
>
> Choose a Side Quest, connect the public chess username you want to use, then play on Lichess or Chess.com. Return to Side Quest Chess to check the result and keep a clear record of your completed quests.
>
> • Pick solo Side Quests built around real chess goals
> • Check public-game proof and see what happened
> • Create and join multiplayer Side Quests with other players
> • Explore community Side Quests and multiplayer challenges
> • Keep your chess usernames and account controls in one place
>
> Side Quest Chess does not ask for or store your Lichess or Chess.com passwords. It has no ads, in-app purchases, subscriptions, or real-money prizes.
>
> Support: https://sidequestchess.com/support
> Privacy: https://sidequestchess.com/privacy
> Terms: https://sidequestchess.com/terms

Before submission, preserve a dated App Store Connect receipt covering bundle association, SKU, locale, version/build, listing fields, screenshots, privacy, age rating, content rights, export compliance, IDFA/tracking, review contact/account, price, tax category, license agreement, territories, release method, DSA/trader status and any current accessibility declaration.

## 5. Age-rating answer draft

The contractual minimum age is 13. Apple's calculated regional storefront rating is a separate result. If Apple calculates any storefront rating below the Terms' 13-year minimum, the operator **must select Override to Higher Age Rating** so the displayed rating adheres to the EULA. The override does not replace in-app eligibility enforcement. Record the current questionnaire version/date, every answer, calculated rating and regional variation before adoption, including the separate result displayed under **Operating Systems Earlier than Version 26**.

Source does not currently ask age during native registration or enforce the 13+ rule on social/UGC access. Treat the owner/legal decision and exact-candidate verification of an age-assurance or eligibility flow as a release blocker; an App Store age-rating override does not prevent an under-13 user from creating an account.

Draft mapped to Apple's current descriptor labels. Preserve the exact live labels and answer controls in the receipt; the live form remains authoritative and each descriptor must be answered separately:

- Advertising: No
- Gambling (presence): No
- Loot Boxes (presence): No
- Simulated Gambling (frequency): None
- Contests (frequency): unresolved; see below
- Parental Controls: No
- Age Assurance: No
- Unrestricted Web Access: No general browser; only specific legal/support/public-proof destinations
- User-Generated Content: Yes — profile names/bios, custom/community quest text, multiplayer text, reports and support messages
- Social Media: Yes — public Community discovery/posting, likes, profiles and creator attribution
- Social Media Disabled for Users Under 13: No
- Messaging and Chat: Yes — Apple's definition includes public posting, which is reachable in Community content
- Contests are present under Apple's current definition, which includes competitions for rankings, rewards or achievement of personal goals. Exact frequency remains unresolved; map how often the reachable ranking, goal, podium and trophy mechanics appear to the live form. There are no money or prizes.
- Profanity or Crude Humor: unresolved across reachable UGC; publisher-authored content is None
- Mature or Suggestive Themes: unresolved across reachable UGC; publisher-authored content is None
- Horror/Fear Themes: None in publisher-authored content; verify reachable UGC
- Medical or Treatment Information: None
- Health or Wellness Topics: None
- Alcohol, Tobacco, or Drug Use or References: unresolved across reachable UGC; publisher-authored content is None
- Sexual Content or Nudity: unresolved across reachable UGC; publisher-authored content is None
- Graphic Sexual Content and Nudity: unresolved across reachable UGC; publisher-authored content is None
- Cartoon or Fantasy Violence: None in publisher-authored content; verify reachable UGC
- Realistic Violence: None in publisher-authored content; verify reachable UGC
- Prolonged Graphic or Sadistic Realistic Violence: None in publisher-authored content; verify reachable UGC
- Guns or Other Weapons: None in publisher-authored content; verify reachable UGC

Starting September 2026, Apple's social-media capability responses are mandatory for new apps and updates. Preserve the submitted answers and resulting Social Media descriptor/Time Allowance classification. Keep `Social Media Disabled for Users Under 13: No` unless the product implements and verifies Apple's required under-13 controls; answering Yes requires at least the Declared Age Range API before enabling social features and delivery of only age-appropriate UGC.

Do not answer mature-content frequencies for the whole reachable UGC experience until moderation/filtering and reachable content are tested. Community Multiplayer has report and block controls; verify whether Community Solo and backend moderation satisfy Apple's current UGC expectations. Crowdler's intended worldwide 13+ distribution is a service-eligibility target, not a uniform displayed Apple rating. Under Apple's questionnaire rules reviewed on 2026-08-21, the draft `Social Media: Yes` answer is expected to produce Australia 16+, Vietnam 16+ and Republic of Korea 15+ regional ratings; preserve the live calculated receipt because the live form remains authoritative.

## 6. App Privacy nutrition-label draft

Tracking draft: **No**, only if binary/provider review confirms no cross-company tracking and no data is used for third-party advertising, developer advertising, sale or data-broker purposes.

Provisional partial inventory: each row below is **collected**, **linked to the user** and **not used for tracking** unless final evidence proves otherwise. It is not a complete nutrition label while the items after the table remain unresolved.

| Apple category/type | Purpose | Current behavior to reconcile |
| --- | --- | --- |
| Contact Info / Name | App Functionality | Name received from Clerk or selected sign-in provider |
| Contact Info / Email Address | App Functionality | Email/password or social-provider identity, including possible relay email |
| Identifiers / User ID | App Functionality; Analytics | Clerk identity/session, display name, username, chess handles, participant/host/report target IDs; signed-in event totals/history are stored with the account |
| User Content / Photos or Videos | App Functionality | Provider/Clerk profile image; no native photo-library feature is intended |
| User Content / Customer Support | App Functionality | Signed-in support text and user-approved diagnostics |
| User Content / Gameplay Content | App Functionality | Quest state, proof attempts/receipts, game IDs, multiplayer participation/standings and saved custom quests |
| User Content / Other User Content | App Functionality | Bio, custom/community/multiplayer text, invite copy, report reasons and block/report records |
| Usage Data / Product Interaction | App Functionality; Analytics | Likes, quest/community actions, proof checks, multiplayer actions, paths/IDs, timestamps, totals and recent activity; the public Privacy Policy says first-party events help understand feature use |
| Diagnostics / Other Diagnostic Data | App Functionality | Technical portion of the optional user-approved support bundle: app version/build/application ID, platform/OS and API destination |

The optional support submission also contains authentication/display state, connected public chess usernames, active solo quest title and multiplayer totals. Keep those values classified in their underlying Identifier, Gameplay Content and Product Interaction rows rather than relabeling them as diagnostics merely because they accompany a support request. The disclosure UI must show or clearly enumerate the full bundle before consent.

The purpose column uses Apple's selectable purpose names only; descriptive concepts such as account management, security, moderation and customer support must be mapped to an available Apple purpose rather than entered as invented values. Third parties/processors to inventory: Clerk and each enabled sign-in provider; hosting/security/request logging; Lichess/Chess.com public-record retrieval; Expo/EAS build services; all embedded SDKs. Obtain an explicit Apple data-type, purpose, linkage and retention disposition for IP address, user agent, session/device identifiers, crashes, performance, hosting/security logs and provider behavior; likely Device ID or Other Data Types cannot be ruled out yet. Optional diagnostics count as collected when submitted. Confirm the signed archive contains a valid privacy manifest for bundled `hermes` and every other Apple-listed SDK, then generate Xcode's aggregate privacy report and verify approved reasons cover every required-reason API. An app-owned manifest may declare only the app's own required-reason API use: each listed third-party SDK must supply its own privacy manifest, and an app manifest cannot cure a missing SDK manifest. Require SDK signatures where Apple requires them for binary dependencies. Do not declare data types absent or adopt this table until backend and provider evidence, generated manifests and IPA inspection agree with `https://sidequestchess.com/privacy`.

## 7. Export-compliance draft

Do not adopt answers until the exact archive and current Apple questionnaire are available. Working classification for owner/legal review:

1. The app uses encryption because it communicates over HTTPS and uses authentication/security libraries: **Yes**.
2. Source review currently finds only encryption within or provided by the operating system and standard public protocols, with no app-authored proprietary cryptography. Expo config therefore declares `ios.config.usesNonExemptEncryption: false`, which generates `ITSAppUsesNonExemptEncryption = false`: **verify again against the exact archive and every embedded SDK**.
3. Adopt the matching App Store Connect exemption answer only after that archive inspection and owner/legal approval, and retain the questionnaire receipt. If Apple requests classification or documentation, stop for owner/legal approval; do not guess or upload documentation in this lane.

## 8. Review notes and access draft

Do not paste until every described path passes on the selected TestFlight build.

> Side Quest Chess lets players choose solo or multiplayer chess challenges and verify results against public games connected to the player's configured Lichess or Chess.com username. The app does not request or store chess-site passwords and is independent from those services.
>
> The signed-out Home and public Multiplayer catalog can be browsed without an account. Sign-in is required for account-backed progress, Community Solo account content, proof checks, creation/joining, support messages, community safety controls and account deletion. [Retain only after exact TestFlight verification of each named signed-out surface.]
>
> Community Multiplayer content and creators can be reported; creators can be blocked. [Replace with exact verified moderation behavior and do not claim review/response operations that are not actually staffed.]
>
> For deletion use a dedicated deletion-only account: My Account → Delete account → type `DELETE MY ACCOUNT` → Permanently delete account. The app signs out only after the deletion request succeeds. [Retain only after exact TestFlight verification.]
>
> Email/password sign-in is available. Google and Facebook return through `sidequestchess://sso-callback`; include them only if both pass final iPhone smoke. Native Sign in with Apple is source-prepared; name it here only after Crowdler capability/provider setup and exact TestFlight verification.
>
> Support: https://sidequestchess.com/support
> Privacy: https://sidequestchess.com/privacy

Create owner-authorized non-personal primary and secondary review accounts that do not expire during review or re-review, plus a deletion-only account. App Store Connect must contain exact credentials, seeded fixture IDs, expected proof result, reset instructions, fallback route and a reachable review contact. After a deletion smoke, recreate/reset the deletion-only fixture and preserve evidence that the submitted credentials work. Never place owner credentials or personal OAuth credentials in review notes. Assign an owner to monitor authentication, APIs, chess-provider fixtures, moderation and deletion throughout review and re-review; submission remains blocked unless those services are live, the fixtures are unexpired, and an alert/reset path is staffed.

## 9. Screenshot/localization plan

Capture only after candidate freeze from the exact selected build with production-like non-personal data.

| Device family | Required while tablet support is enabled | Suggested ordered frames |
| --- | --- | --- |
| 6.9-inch iPhone (preferred; 6.5-inch accepted as Apple's fallback if no 6.9-inch set is supplied) | 6.9-inch portrait `1260×2736`, `1290×2796` or `1320×2868`; fallback 6.5-inch portrait `1284×2778` or `1242×2688`; inverse dimensions for landscape; 1–10 images, no alpha | Home/selection; quest detail/proof; multiplayer; community; Trophy Cabinet; account/support |
| 13-inch iPad | Portrait `2064×2752` or `2048×2732` pixels, or inverse landscape; 1–10 images, no alpha; required while the app runs on iPad | Same representative feature set with truthful tablet layout |

Initial locale: English (U.S.). If another locale is added, localize its required text fields and review every inherited asset; App Store Connect localizations may inherit screenshots from the primary localization, so translated screenshot sets are an internal quality choice rather than an Apple requirement. App preview is optional. Keep a manifest with source SHA, version/build, build ID, device/display, OS, orientation, locale, fixture, filename, exact dimensions and SHA-256. Reject stale product names, debug overlays, personal data, fake achievements, pricing, clipped UI or keyboard/modal residue.

## 10. Same-candidate QA and TestFlight smoke

Record device, OS, build, source SHA, account fixture, timestamp, result and evidence for each pass. The frozen prebuild/archive must establish the exact iOS deployment target. Cover both that minimum supported iOS/iPadOS version and the then-current public OS; do not infer the minimum from Expo defaults or this packet.

| Surface | iPhone physical | iPad physical while supported |
| --- | --- | --- |
| Clean/update install, launch, offline/reconnect | Required | Required, including full-screen/multiwindow |
| Signed-out Home/Solo/Multiplayer and legal links | Required | Required |
| Email/password and each shipped social login | Cold start, cancel, browser return, persistence | Same |
| Deep link | Valid, malformed/repeated callback, logout | Same |
| Solo/custom/proof/share/reset | Required | No clipping, keyboard or modal traps |
| Multiplayer/community | Create/join/leave/proof/report/block | Same |
| UGC publication/moderation | Reject/filter objectionable text before publication; verify report reaches the staffed queue, escalation/response SLA, removal, and block coverage on every discovery/detail surface | Same |
| Trophy/account/support | Diagnostics default-off and preview | Same |
| Deletion | Exact phrase/action; failed cleanup preserves identity; successful sign-out | Same |
| Privacy/network reconciliation | Capture exact requests for signed-out, signed-in, OAuth, proof, support and deletion flows; reconcile Clerk/providers, IP/user-agent/session/device IDs, diagnostics, crashes and performance with the label draft | Same |
| Accessibility | VoiceOver, Voice Control, Larger Text at Apple's specified scale, Dynamic Type, focus, labels, contrast, Differentiate Without Color, Reduced Motion and touch targets | Same plus split-view overflow/focus |

TestFlight acceptance additionally requires: store-delivered install; correct name/icon/version/build/API; non-expiring primary/secondary review account verification; recreated deletion fixture; public chess fixture; second-account multiplayer; background/foreground and forced relaunch; no secrets/tokens in logs; successful deletion and signed-out relaunch; review notes within Apple's 4,000-byte limit. Deletion acceptance must prove removal or irreversible anonymization of the profile/bio, custom and community quests, multiplayer text, posts, creator attribution, likes and support content, plus the approved handling of target identifiers replicated into other users' report/block records. Any legally retained field needs a documented basis, exact period and user disclosure; if completion is delayed, show the timeframe and provide confirmation. If Sign in with Apple is shipped, verify cancellation, relay email, account linking and token-revocation behavior on deletion.

Choose the TestFlight path before mutation: internal-only smoke does not require TestFlight App Review, while external TestFlight does. If external testing is authorized, prepare Beta App Description, Feedback Email, TestFlight contact information, per-build What to Test, beta-review credentials/instructions and an explicit automatic-versus-manual tester-notification choice. Create and verify an internal group before creating an external group, as Apple currently requires. These fields are drafts until the exact candidate passes internal smoke; adding groups, testers or a build remains separately approval-gated.

## 11. Least-privilege access and owner authorization packet

Use a dedicated Sam/Crowdler Apple Account with MFA and Crowdler-controlled recovery. Do not use Andreas's personal Apple identity. Apple access does not solve Expo custody: source names Expo owner `and72nor`; approve a least-privilege organization invitation or project transfer separately before iOS cloud build/credentials work.

**Exact owner action requested — discovery only, no mutation:**

- **What Andreas must do:** confirm in writing the dedicated Crowdler/Sam Apple Account address and authorize that already-provisioned identity, only if it is already on the correct Crowdler AB team, to read Team ID/membership status, search Apple Developer for bundle ID `com.sidequestchess.app`, search App Store Connect for Side Quest Chess/app records/SKUs, and report the highest existing iOS build number.
- **Return receipt:** legal entity, Team ID, membership status/expiry, operator address, current role/app scope, duplicate-search results, any app-record ID/SKU/bundle association and highest build number; redact personal/security data.
- **Stop conditions:** stop without accepting or changing anything if the identity is not already provisioned, legal entity is not exactly Crowdler AB, a personal team is selected, Apple presents an agreement/attestation, access is broader than intended, a duplicate exists or any fee is shown.
- **Deadline:** before authorizing the first Apple credential or iOS build operation. No public launch date is claimed.
- **Expected cost:** SEK 0 if membership/access already exist. Enrollment, renewal, invitation, acceptance, payment or agreements require a separate approval.
- **What it unblocks:** selecting a non-colliding build number and preparing exact later approvals for bundle capability/signing, Sign in with Apple and the first build. It does not authorize those actions.

If the identity is not provisioned, first separate discovery-only needs from later build or App Store mutation duties. Apple does not provide a general read-only discovery role for every needed surface, while Developer and App Manager both carry mutation powers. Any later invitation request must name inviter, invitee, exact Crowdler AB Team ID, the narrowest role justified by a task-by-task permissions matrix, app scope, any additional Certificates/Identifiers/Profiles permission, cost, terms/attestation and revocation owner. Invitation and acceptance are mutations.

Current App Store Connect task/role boundaries to re-check in Apple's live role-permissions table before any invitation:

| Task | Current documented roles that can perform it | Lane rule |
| --- | --- | --- |
| Build upload | Account Holder, Admin, App Manager or Developer | A Developer role is sufficient only for upload; it does not satisfy metadata/privacy/compliance duties |
| Age rating | Account Holder, Admin, App Manager or Marketing | Adoption remains owner/legal-approved even if Marketing can operate the form |
| Privacy data-type responses and publication | Account Holder, Admin or App Manager | Do not broaden a Developer solely for build upload |
| Privacy-policy URL | Account Holder, Admin, App Manager or Marketing | Separate from publishing the privacy responses |
| DSA trader compliance | Account Holder or Admin | This includes legal certification and verification; never treat it as a routine listing edit |

The eventual invitation packet must select the least-privilege combination for the exact authorized tasks and explicitly exclude user administration, agreements, tax/banking and payment access unless separately required and approved.

## 12. Approval boundaries and binary acceptance

Written approval is required before enrollment/payment; legal/tax/banking acceptance; App Store Connect mutation; invitations/attestations; account-tied certificates, identifiers, profiles, API keys or credentials; TestFlight upload/testers; privacy/age/content-rights adoption; review submission; phased/public release; external communication; or use of Andreas's personal Apple identity.

Before upload, inspect the exact IPA for:

- `CFBundleIdentifier = com.sidequestchess.app`
- display name `Side Quest Chess`, approved version and unique build number
- `sidequestchess` URL scheme and production API with no development-server references
- Crowdler AB distribution team/signature and only intended entitlements
- accurate export-compliance plist/questionnaire alignment
- embedded privacy manifests/SDK signatures and complete SDK inventory
- no unexpected advertising, tracking, purchase, location, camera, microphone, photo, contacts or biometric capability

Source freeze, signed archive, TestFlight upload, TestFlight device acceptance, App Review submission, App Review acceptance, release approval and public storefront availability are distinct states. Preserve exact App Store Connect receipts: an internal TestFlight build may become **Ready to Submit** without TestFlight App Review; external testing proceeds through **Waiting for Review**, **In Beta Review** and **Ready to Test/Testing**, and builds expire after 90 days. Production proceeds separately through **Prepare for Submission**, **Ready for Review**, **Waiting for Review** and **In Review**; manual release normally reaches **Pending Developer Release** before processing and verified storefront availability. Never treat “uploaded,” “approved,” “accepted” or “released” as interchangeable.

## 13. Current local tool constraints

- A clean temporary `expo prebuild --platform ios --no-install` from this branch completed on 2026-08-21. The generated target resolved `PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app`, device family `1,2`, display name `Side Quest Chess`, generated `CFBundleShortVersionString = 0.1.349` while the Xcode project retains `MARKETING_VERSION = 1.0`, with build `1`, URL schemes `sidequestchess` plus `com.sidequestchess.app`, deployment target `15.1`, and `com.apple.developer.applesignin = Default` in the app entitlements. The literal generated plist value agrees with source, so the stale Xcode build setting is not by itself evidence of a submitted-version mismatch; inspect the actual archive rather than inferring its identity from either source alone.
- A subsequent source-safe config correction declares exempt-only encryption and generates `ITSAppUsesNonExemptEncryption = false`; the exact archive and embedded SDK inventory must still confirm that declaration before upload. Source now explicitly pins `NSAllowsArbitraryLoads = false` and Expo's existing narrow `NSAllowsLocalNetworking = true` behavior to prevent future template drift; Expo introspection and a clean prebuild confirm both generated `NSAppTransportSecurity` values, but the archived `Info.plist` remains the release receipt. The generated `Info.plist` contained no sensitive-resource usage description. It enabled iPad portrait, upside-down and both landscape orientations with `UIRequiresFullScreen = false`. No app-target `PrivacyInfo.xcprivacy` was generated before pod installation. These are audit findings, not archive evidence; inspect pods, merged privacy report and signed IPA later.
- The pull-request mobile release gate now generates both iOS and Android native projects from Expo config without signing, Apple account access, EAS build, upload or submission. This catches cross-platform prebuild regressions but does not prove CocoaPods installation, Xcode compilation, archive contents, signing or device behavior.
- Full Xcode is not selected/available; Command Line Tools are active.
- App Store upload remains blocked until the archive is compiled with Xcode 26 or later and the iOS 26 SDK, Apple's requirement in effect since 2026-04-28. Both EAS production profiles now pin Expo SDK 54's `macos-sequoia-15.6-xcode-26.0` iOS image; preserve the EAS environment log, exact `xcodebuild -version`, SDK and archive receipt. Re-check the image remains available and App Store-capable at source freeze. Xcode 27 beta acceptance for TestFlight is not evidence of App Store production eligibility; use an Apple-documented App Store-capable production Xcode release for the final archive.
- No valid local Apple code-signing identities are installed.
- EAS CLI `22.2.0` is runnable through `npx`; its read-only `whoami` on 2026-08-20 returned Andreas's personal identity. Do not run Apple credential, iOS build or submit operations from that identity.
- No Apple account, App Store Connect, credential, build, upload or external communication was attempted in this lane.

Authoritative Apple references to re-check at account-entry time:

- https://developer.apple.com/help/app-store-connect/reference/app-information/
- https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
