# Side Quest Chess — iOS App Store release-preparation packet

**Prepared:** 2026-08-21; reconciled 2026-08-22<br>
**Source baseline:** `5b0491fa1f27fb06bfb902993bef58c05bb1299c` (`origin/main`, fetched and merged 2026-08-22); current iOS source-preparation and receipt changes remain under PR review<br>
**Status:** Drafts and verified source audit only. This is not an App Store Connect record, Apple credential, IPA, TestFlight build, review submission, approval, or public release.

This packet supersedes the iOS portions of `SQC_MOBILE_APPLE_PRIVACY_PREP_2026-07-03.md`, `SQC_MOBILE_STORE_LAUNCH_PREP_2026-07-07.md`, and `SQC_MOBILE_STORE_SUBMISSION_PACK_2026-07-07.md` for this source baseline.

## 1. Verified baseline and blockers

- Current source: Expo version `0.1.349`; Android source version code `349`.
- Android launch evidence is separate: repository receipts describe `0.1.349 (350)` on Google Play Internal testing. This lane did not read Play Console or claim Android public launch.
- Android and web public launch must be verified before iOS App Review submission or public release. iOS preparation, source verification, and approved TestFlight work may proceed before that predecessor milestone; none of those states waive the launch-order gate.
- Public identity: **Side Quest Chess**. Do not use “SQC” in public copy.
- Bundle ID candidate: `com.sidequestchess.app`; Expo scheme: `sidequestchess`; native callback: `sidequestchess://sso-callback`.
- Publisher/controller target: Crowdler AB. Worldwide 13+ target. No ads, IAP, subscriptions, or real-money prizes.
- `supportsTablet` is `true`; iPad build, responsive QA, and screenshots are therefore release gates.
- This branch now prepares native Sign in with Apple beside email/password, Google, and Facebook: the Expo plugin and iOS entitlement declaration are present, Clerk's native flow is wired, Clerk's cancellation return shape is treated as non-fatal, and both signed-out account surfaces expose Apple's native button on iOS. Guideline 4.8 requires an equivalent login option with the specified privacy characteristics rather than naming Sign in with Apple as the only possible implementation; Side Quest Chess has selected Sign in with Apple, and compliance remains blocked until the approved Crowdler App ID/provider configuration exists and account linking, relay email, revocation, deletion, and exact-candidate physical-iPhone behavior pass end to end.
- Password reset for password accounts is now source-prepared: the signed-out account panel can request an email reset code, verify it, then set a new password; a completed reset signs out other authenticated sessions and activates the replacement Clerk session. The current source does not continue a reset that Clerk routes to a second factor, so MFA recovery is blocked rather than merely unverified. Exact-candidate email delivery, reset, session revocation, and real-iPhone UI remain not verified.
- Signed-in account recovery is now source-prepared: if Clerk remains authenticated while account details cannot be loaded, My Account shows an explicit unavailable state with retry, deletion, logout and support controls instead of incorrectly presenting social/password sign-in. Exact-candidate offline/reconnect and deletion behavior remain device gates.
- No deliberate iOS build number is source-controlled. The EAS production profile has `autoIncrement: true` with local app-version sourcing, while a disposable clean prebuild currently defaults to build `1`; neither establishes the next available App Store Connect number or a reproducible first iOS candidate. No final privacy manifest report, signed IPA, TestFlight build, or physical-iPhone callback proof exists.
- The live Support page is reachable, but its signed-out production rendering does not expose direct Crowdler AB contact information. This branch now adds the already-published Crowdler AB email and legal address to the signed-out Support screen with regression coverage. Apple requires the Support URL to lead to actual contact information as required by local law, so the listing remains blocked until the change is deployed and re-read from production; owner/legal must also confirm whether a telephone number is locally required.
- Guideline 1.2 UGC readiness is a source blocker, not merely a QA question: public profile/quest/invite/bio inputs have no verified objectionable-content filter; content/creator reports are written into each reporter's private Clerk metadata with no implemented operator workflow found; and creator blocking filters Community discovery for that user rather than proving that abusive users can be blocked from the service. Filtering, timely report handling/removal, and required block outcomes must be implemented and tested before submission. A central queue and broader interaction blocking are Side Quest Chess's proposed implementation, not Apple-prescribed architectures. Owner/legal must also determine whether community-authored Side Quests are Creator Content under Guideline 1.2.1; if so, identify content exceeding the app's age rating and restrict access using verified or declared age as Apple requires.
- Full Xcode 26.6 (build `17F113`) is now selected at `/Applications/Xcode.app/Contents/Developer`, its first-launch components completed installation, and the iOS 26.5 SDK is visible. This satisfies the version floor for local source compilation under Apple's upload-toolchain requirement effective 2026-04-28, but it is not archive or upload evidence. CocoaPods 1.17.0 is now installed. No valid local Apple signing identity is verified.
- The iOS 26.5 (`23F77`) Simulator runtime is now registered and exact iPhone/iPad destinations are visible. The earlier duplicate-disk-image and interrupted-CoreSimulator failures are retained below as historical troubleshooting receipts, not current blockers.
- EAS is associated with owner `and72nor`; the verified authenticated identity is Andreas’s personal identity. Do not use it for Apple access, credentials, build, or submission.

### Disposable native-generation receipt

A clean detached worktree at branch commit `1ec2401b45d209db722bcb13c9194a318cc094c4` completed `expo prebuild --platform ios --no-install` on 2026-08-22 without Apple access or signing. The generated project was inspected and discarded; it was not adopted as release source. The frozen lockfile SHA-256 was `06215d237672b2d31765d3af7e4f6a82b50885d3631fc111b307f3d19ce032b7`; the only generated Git state was the untracked `apps/mobile/ios/` tree. After the current Sign in with Apple change, the same bounded prebuild completed again from the reconciled branch working tree with lockfile SHA-256 `5edd63864c5af4d5a85718e5af02bc769ae7634d8b8b60349a4f08c03d3317e9`; the generated tree was inspected and removed. A further clean detached worktree at branch commit `17ec3dac7bda3d661ca1621e64b8b8415e77d254` completed frozen dependency installation, the same iOS prebuild, and `pod install` with CocoaPods 1.17.0. That generated tree remains disposable build evidence and is not release source.

- Generated display name: `Side Quest Chess`.
- Generated plist short version/build: `0.1.349` / `1`; project build settings also contain `MARKETING_VERSION = 1.0`, so the archive plist—not a single project setting—must control final identity review.
- Bundle ID: `com.sidequestchess.app`; targeted device family: `1,2`; deployment target: iOS `15.1`.
- URL schemes: `sidequestchess` and `com.sidequestchess.app`.
- The first receipt had an empty entitlements dictionary. The post-change receipt generated `SideQuestChess.entitlements`, linked it through `CODE_SIGN_ENTITLEMENTS`, and contained `com.apple.developer.applesignin = Default`. This is source-generation evidence only—not proof of an Apple-account capability, provider configuration, signing, or working login.
- ATS: arbitrary loads `false`; local networking `true`. The narrow local-network allowance and all production endpoints still require archive/network review.
- iPhone orientations: portrait and upside-down. iPad orientations: portrait, upside-down and both landscapes; `UIRequiresFullScreen = false`, so multitasking widths are a required QA seam.
- No sensitive-resource usage description appeared in the generated Info.plist.
- No `.xcprivacy` file existed immediately after `--no-install`. After CocoaPods installation, privacy-manifest aggregation created `SideQuestChess/PrivacyInfo.xcprivacy` with tracking `false`, no native collected-data declarations, and required-reason entries for file timestamps (`C617.1`, `0A2A.1`, `3B52.1`), user defaults (`CA92.1`), disk space (`E174.1`, `85F4.1`), and system boot time (`35F9.1`). Pod resource bundles also carry Expo/React manifests. This generated report must still be reconciled against actual backend/provider data collection and the exact archive; an empty native collected-data array is not an App Privacy answer.
- Historical attempt: an unsigned generic Simulator build under Xcode 26.6 failed at `SplashScreen.storyboard` after the CoreSimulator service connection was interrupted, and its immediate retry could not see the downloaded runtime. After runtime registration recovered, the latest native-build receipt at commit `ee1c7d68` passed an unsigned Release Simulator build on iPhone 17 Pro / iOS 26.5 and found the expected Side Quest Chess signed-out screen. Earlier iPad launches are historical narrative evidence from an older branch commit, not exact-current-source responsive evidence. This is local unsigned Simulator evidence only. No signed archive, TestFlight build, or physical-iPhone evidence exists.

## 2. Fail-closed gate ledger

| Gate | State | Required evidence |
| --- | --- | --- |
| Crowdler AB Apple legal team | Blocked | Legal entity, private team-identity match, membership status/expiry; do not retain the Team ID |
| Dedicated Crowdler/Sam operator | Blocked | Exact Apple Account, MFA/recovery custody, role and app scope; never Andreas’s personal identity |
| Bundle/app reconciliation | Blocked | Apple Developer and App Store Connect searches for `com.sidequestchess.app`, including duplicate/App ID/app record/SKU results |
| Source freeze | Not frozen | Clean approved commit, lockfile hash, approved version and unique build number |
| Guideline 4.8 login | Source prepared; deletion revocation and integration blocked | Apple authorization-token revocation implemented for account deletion; Crowdler App ID/provider configuration under separate approval; account linking, cancellation, relay email, Apple/Google/Facebook credential revocation, deletion, and physical-iPhone tests |
| Guideline 1.2 UGC safety | Blocked | Objectionable-content filtering, timely report response/removal workflow, published contact information, and the required ability to block abusive users from the service verified end to end; central queue and broader interaction blocking are the proposed product design |
| Generated native audit | Local source build passed; final candidate blocked | Clean frozen-candidate prebuild diff; Info.plist, entitlements, URL types, deployment target, SDKs and privacy manifests |
| Signed candidate | Blocked | IPA hash, identity/version/build, Crowdler signature/team, entitlements and export-compliance inspection |
| Privacy labels | Draft only | Backend/provider/SDK/manifest/network reconciliation against exact IPA |
| Privacy policy safety data | Source prepared; production blocked | Report and block disclosures are source-prepared; production deployment and signed-out readback remain blocked |
| Required-reason APIs | Blocked | Exact-archive inventory; every used category declared by the responsible app or SDK manifest with an Apple-approved reason that matches actual behavior |
| Age rating / 13+ access | Draft only | Live questionnaire receipt and owner/legal-approved 13+ eligibility behavior |
| Screenshots | Blocked | Fresh same-candidate iPhone and iPad captures |
| Support URL contact | Source fix pending deployment | Production signed-out page exposes the verified legal address and direct email, accepts issue/feedback contact, and includes a telephone number if owner/legal confirms it is locally required |
| Content rights | Blocked | Owner/legal-approved answer and evidence covering Lichess/Chess.com records, names, APIs and any marks in metadata/assets for every selected territory |
| EU trader status | Blocked | Owner/legal self-assessment, app-specific selection, verified Crowdler AB contact/address and all Apple-requested evidence before EU distribution |
| Compatibility availability | Blocked | Explicit opt-out or same-candidate QA/support decision for default Apple-silicon Mac and Apple Vision Pro availability |
| Distribution method | Blocked | Owner-approved Public or Private Distribution decision plus exact territory strategy before submission |
| Republic of Korea availability | Blocked | Live “Availability in the Republic of Korea” property, RCN applicability decision, and any required registration readback before South Korea is included |
| TestFlight | Not started | Approved upload, tester configuration and store-delivered install receipt |
| Real iPhone smoke | Blocked | Exact TestFlight build, signed-out and signed-in flows, callback and deletion |
| Review submission | Not started | Separate approval and App Store Connect readback |
| Public release | Not started | Separate approval and storefront availability readback |

## 3. Safe source work still required

Use strict RED–GREEN–REFACTOR for each behavior change and preserve failing-test output before implementation.

1. Complete the prepared Sign in with Apple integration: implement Apple authorization-token revocation in the account-deletion path, then, after explicit approval, reconcile the Crowdler App ID capability and Clerk/provider configuration and verify account linking, cancellation/error behavior, relay-email handling, credential revocation, and deletion on the exact TestFlight candidate. Deleting only the Clerk user is not evidence that Apple authorization was revoked. Also provide an in-app mechanism to revoke Google and Facebook credentials and disable their data access as required by Guideline 5.1.1(v). Do not create capabilities or provider credentials without approval.
2. Add a deliberate iOS build-number policy after reading the highest existing App Store build number.
3. Determine export compliance before making a source or App Store Connect declaration. TLS and OS-supplied cryptography still require answering Apple's encryption questions; establish what the exact binary uses, then determine whether documentation is exempt. Current source has no `usesNonExemptEncryption` declaration, and archive inspection alone does not make the legal determination.
4. Keep the new pull-request iOS source gate green: it generates an unsigned iOS project from Expo config, removes the generated tree, then continues with Android generation and managed-config checks. This catches prebuild regressions without Apple credentials, but it does not prove CocoaPods, Xcode compilation, signing, archive contents or device behavior. For a release candidate, repeat native generation in a clean frozen worktree and immediately inspect the complete diff, generated Info.plist/entitlements/URL types, all usage descriptions, deployment target, iPad orientations, ATS settings, SDK privacy manifests, required-reason APIs, and SDK signatures.
5. Resolve tablet policy: retain support only after iPad responsive acceptance and screenshots, or seek explicit product approval to disable it before freeze.
6. Reconcile the privacy policy and nutrition label with Clerk, Google, Facebook, Apple if added, hosting/security logs, Expo runtime, optional support diagnostics, Lichess/Chess.com public-record retrieval, and all transitive native SDK behavior.
7. Platform-aware support identity is now implemented on this branch: iOS reports the bundle ID and native version/build under the distribution-neutral label “iOS app build,” without claiming an App Store/TestFlight channel, Android APK, or GitHub release. Preserve the identity regression tests and verify the rendered diagnostics on the selected TestFlight build.
8. Replace the current per-reporter metadata report sink with the proposed central, access-controlled moderation queue; implement content filtering and enough block coverage to prove abusive users can be blocked from the service. Define response/removal ownership and service levels before claiming Guideline 1.2 readiness. Determine whether community-authored Side Quests are Creator Content and, if they are, implement the required above-rating identification and age-based restriction. The queue architecture and any block coverage beyond Apple's required outcome are product choices, not quoted Apple requirements.
9. Preserve native-platform provenance for report/block actions. This branch now sends `ios` from iOS and `android` from Android and records either as mobile evidence; final TestFlight smoke must verify the selected candidate end to end.
10. Remove production-facing QA/test copy from the offline fallback, verify the source-prepared password-reset path on the exact candidate (including email delivery, other-session revocation and MFA behavior), decide universal-link behavior for shared quest URLs, and reconcile Google/Facebook as privacy processors before source freeze.

## 4. App Store listing draft — English (U.S.)

These are proposed values only; adopting them in App Store Connect is approval-gated.

| Field | Draft |
| --- | --- |
| Name | Side Quest Chess |
| Subtitle | Turn chess games into quests |
| Primary language | English (U.S.) |
| App Store version | `0.1.349` — provisional; bind to the selected archive and live version readback |
| SKU | `sidequestchess-ios` — owner must approve before immutable record creation |
| Primary category | Games |
| Games subcategories | Board; Strategy |
| Secondary category | None |
| Price | Free |
| Copyright | 2026 Crowdler AB |
| Made for Kids | No — provisional; owner must confirm before app-record creation |
| User Access | Provisional app-scoped access only; select and read back the exact app-record User Access setting after the dedicated operator and role are approved |
| Privacy Policy URL | https://sidequestchess.com/privacy |
| Support URL | https://sidequestchess.com/support |
| Marketing URL | https://sidequestchess.com |
| Release method | Manual release |
| Phased release | Not applicable to the first App Store version; decide separately for later version updates |
| License | Standard Apple EULA unless owner/legal approves another agreement |

**Promotional text**
Pick a Side Quest, play your public chess games, and come back for a checked result.

**Keywords**
`challenge,quests,board,strategy,goals,multiplayer,achievements`

**Description**

> Side Quest Chess turns the games you already play into memorable chess challenges.
>
> Choose a Side Quest, connect the public chess username you want to use, then play on Lichess or Chess.com. Return to Side Quest Chess to check the result and keep a clear record of your completed quests.
>
> • Pick solo Side Quests built around real chess goals<br>
> • Check public-game proof and see what happened<br>
> • Create and join multiplayer Side Quests with other players<br>
> • Explore community Side Quests and multiplayer challenges<br>
> • Keep your chess usernames and account controls in one place
>
> Side Quest Chess does not ask for or store your Lichess or Chess.com passwords. It has no ads, in-app purchases, subscriptions, or real-money prizes.
>
> Support: https://sidequestchess.com/support<br>
> Privacy: https://sidequestchess.com/privacy<br>
> Terms: https://sidequestchess.com/terms

Before adoption, verify the live field limits, unique name/SKU, territories, content rights, EU trader status, tax category, version/build, review contact, accessibility declarations, exact User Access selection, Made for Kids answer, and copyright ownership and year. “What’s New” is unavailable for the first App Store version and required for each later version. A worldwide consumer App Store launch requires Public Distribution; Private Distribution is limited to specifically identified organizations through Apple Business Manager or Apple School Manager and is not a private consumer launch. Owner must explicitly approve the applicable method before submission. Public versus Private Distribution cannot be changed after approval without a new app record and binary; conversion from public to unlisted is the limited exception. Also decide whether “All Countries or Regions” may opt the app into storefronts Apple adds later or whether to use a specific approved territory list. For China mainland, obtain and verify the NPPA game approval number and supporting documents, and determine whether an MIIT ICP Filing Number is also required; if required, its metadata must match the App Store localization or primary language. For Vietnam, verify the required game-publishing license. Explicitly exclude any storefront whose required documentation is unavailable before submission.

## 5. App Privacy nutrition-label draft

Tracking draft: **No**, only if exact-binary/provider evidence confirms no cross-company tracking, advertising use, sale, or data-broker use.

Each provisional row is **collected**, **linked to the user**, and **not used for tracking** unless final evidence proves otherwise.

| Apple data type | Purpose | Current behavior to reconcile |
| --- | --- | --- |
| Contact Info / Name | App Functionality | Name from Clerk or selected login provider |
| Contact Info / Email Address | App Functionality | Password/social identity, including possible Apple relay email |
| Identifiers / User ID | App Functionality; Analytics | Clerk identity/session, chess handles, participant/host/report identifiers |
| User Content / Photos or Videos | App Functionality | Provider/Clerk profile image; no native photo-library feature intended |
| User Content / Customer Support | App Functionality | Support text and optional user-approved diagnostics |
| User Content / Gameplay Content | App Functionality | Quest state, proof attempts/results, game IDs, standings and custom quests |
| User Content / Other User Content | App Functionality | Bio, community/multiplayer text, invite copy, report reasons and block/report records |
| Usage Data / Product Interaction | App Functionality; Analytics | Likes, proof checks, quest/community/multiplayer actions, timestamps and account history |
| Diagnostics / Other Diagnostic Data | App Functionality | Optional support bundle: application ID, app version/build, OS/platform, API destination and timestamp. Its account/display-name state, chess handles, active solo quest and multiplayer/public-hosted counts must also remain reconciled under their underlying Identifiers, Gameplay Content and Product Interaction categories rather than being treated as diagnostics alone |

Unresolved before adoption: IP address, user agent, session/device identifiers, hosting/security logs, crashes/performance, retention/deletion periods, processor purposes, SDK-collected data, and provider-specific behavior. Report and block disclosures are source-prepared in the policy, but production deployment and signed-out readback remain blocked. The processor description also does not yet clearly cover direct Google, Facebook, and Apple sign-in processing. For optional diagnostics, apply Apple's definition of collection and optional-disclosure exception only after verifying retention, purpose, infrequency, clear disclosure, affirmative submission on every occasion, and absence of tracking/advertising or reuse; transmission alone neither proves nor disproves disclosure. Inventory required-reason APIs used by the app and every embedded SDK in the exact archive, then verify that the responsible app or SDK privacy manifest declares an Apple-approved reason matching actual behavior for every used category. Missing or unsupported reasons block upload; an aggregate privacy report is evidence for reconciliation, not a substitute for the required declarations. For SDKs on Apple's listed commonly used third-party SDK requirement, the app’s own manifest cannot substitute for the required SDK manifest; listed binary SDK dependencies also require signatures. Reconcile at the App Store Connect app-record level as well as against the IPA because Apple privacy answers apply across all Apple platforms associated with that app record.

## 6. Age-rating draft

The contractual minimum age is 13; Apple’s calculated regional rating is separate. Preserve the exact live questionnaire version, every answer, calculated global/regional ratings, the separate ratings App Store Connect shows for operating systems earlier than version 26, and any override. If the EULA minimum age is above Apple's calculated rating, apply Apple's required qualifying higher-rating override. A storefront override does not enforce account eligibility, so the in-app 13+ eligibility behavior remains a separate owner/legal decision and candidate gate.

Working answers:

- Made for Kids: No — provisional; confirm in the live app record and keep all screenshots/metadata suitable for the resulting audience
- Advertising: No
- Gambling, simulated gambling, loot boxes: No / None
- Parental Controls: No
- Age Assurance: No — owner/legal product gate for the intended 13+ social/UGC service until an eligibility approach is approved and verified; do not present this internal gate as a universal Apple requirement without a current rule specific to the candidate
- Unrestricted Web Access: No; only specific auth, legal, support, and public-proof destinations
- User-Generated Content: Yes
- Social Media: Yes — public discovery/posting, likes, profiles and creator attribution
- Messaging and Chat: Yes — public posting is reachable and is included in Apple's current definition
- Social Media Disabled for Users Under 13: No — no verified Declared Age Range API integration or age-gated social surface exists.
- Contests: Frequent as the working draft because quests, rankings and goals are core functionality; confirm against the live questionnaire and exact candidate. There is no money or prize.
- Profanity, mature themes, drugs, sexual content, violence and weapons: publisher-authored content is intended None, but reachable UGC must be moderated and audited before selecting frequencies

Verify report, block, filtering, moderation queue, response/removal process, and every Community surface. Do not infer the final storefront rating from this draft.

“13+” is the contractual/in-app minimum, not a promise of one uniform storefront rating. Under Apple's OS 26-and-later rating system, Social Media answered Yes indicates higher regional ratings including Australia 16+, Vietnam 16+, and Korea 15+. Earlier operating systems can display different ratings, so preserve both sets of live calculated regional receipts before territory approval.

Beginning in September 2026, Apple requires the new age-rating responses about social-media capabilities for new-app and update submissions. If Side Quest Chess is submitted then or later, preserve live App Store Connect readback of every new social-media capability response, not only the calculated rating. For South Korea, also complete and read back the separate “Availability in the Republic of Korea” property before including that storefront. Determine RCN applicability from the final live answers: Apple's current triggers include KR-19, Casino/17+, or specified Frequent/Intense content; a Korean 15+ result does not by itself require an RCN.

## 7. Review notes draft

Do not paste until every statement passes on the selected TestFlight build.

> Side Quest Chess lets players choose solo or multiplayer chess challenges and check results against public games associated with a configured Lichess or Chess.com username. The app does not request or store chess-site passwords and is independent from those services.
>
> Signed-out public areas: [list only exact surfaces verified on the submitted build]. Sign-in is required for account-backed progress, proof checks, creation/joining, support messages, safety controls, and account deletion.
>
> Safety: [state exact verified report, block, moderation, and response behavior; do not promise unstaffed operations].
>
> To delete an account: My Account → Delete account → type `DELETE MY ACCOUNT` → Permanently delete account. The app signs out after deletion succeeds. [Retain only after verifying deletion of the entire account, associated personal data and shared user-generated content; any legally required retention, completion timing and confirmation must be disclosed and tested.]
>
> Login methods verified on this build: [list only methods that pass exact-candidate physical-iPhone smoke]. Google and Facebook browser SSO return through `sidequestchess://sso-callback`; Sign in with Apple uses the native Apple/Clerk token flow.
>
> Support: https://sidequestchess.com/support<br>
> Privacy: https://sidequestchess.com/privacy

Create owner-authorized, non-personal primary/secondary review fixtures plus a deletion-only fixture. Put the non-expiring primary username/password in Apple's credential fields and secondary/deletion fixture details in Review Notes; do not place credentials in source or this packet. Read back the review contact name, email and international-format phone, and keep Review Notes within Apple's live byte limit. Include seeded IDs, expected proof result, reset instructions, fallback route, reachable review contact, and an owner monitoring auth/API/provider/moderation/deletion services throughout review. Recreate the deletion fixture after smoke.

For every shipped SSO provider, provide the non-expiring demo login information and instructions Apple requests in App Review Information. Do not assume that the ordinary email/password demo account substitutes for provider-specific SSO review access; use another arrangement only if Apple explicitly confirms it for this submission. Never provide a reviewer with credentials for a personal account. Freeze one App Store version value and verify that exact value in the selected archive; current source/generated settings do not yet provide that receipt.

## 8. Screenshot and localization plan

Capture fresh images from the exact selected build with fictional, non-personal account data that truthfully represents the candidate. Initial locale: English (U.S.). Add localizations only with reviewed field copy and asset inheritance. Every frame must show the app in use rather than only a title, splash, or login screen, and remain suitable for a 4+ metadata audience regardless of the calculated app age rating.

- App icon: verify the exact archive contains the visually approved 1024×1024 App Store icon with no alpha; inspect the rendered artwork for stale names or abbreviations and preserve an identity/hash receipt.
- iPhone: 6.9-inch portrait at `1260×2736`, `1290×2796`, or `1320×2868`; 1–10 frames with no alpha. If a 6.9-inch set is not supplied, Apple's current fallback requires a 6.5-inch set at `1284×2778` or `1242×2688`. Proposed order: Home/selection, quest detail/proof, multiplayer, community, Trophy Cabinet, account/support.
- iPad: while `supportsTablet` remains enabled, supply a required 13-inch set: portrait `2064×2752` or `2048×2732`; landscape `2752×2064` or `2732×2048`. Capture equivalent truthful tablet frames and re-read Apple's specification at capture time.
- Re-verify all exact pixel dimensions and accepted fallback sizes in live Apple documentation at capture time.
- Save each accepted screenshot as `.jpeg`, `.jpg`, or `.png`, and manifest source SHA, version/build, build ID, device/display, OS, orientation, locale, fixture, dimensions, filename, format, and SHA-256.
- Reject stale names, debug overlays, personal data, fake achievements, pricing, clipping, and keyboard/modal residue. App preview is optional.

## 9. Same-candidate QA matrix and TestFlight smoke

Record device, OS, source SHA, version/build, TestFlight build ID, fixture, timestamp, result, and evidence. Before execution, name exact hardware models and OS versions for (1) a real iPhone on the current public OS, (2) minimum-iOS 15.1 compatibility using the oldest available representative device/simulator, (3) the exact 6.9-inch screenshot device, and (4) an exact 13-inch iPad capture/QA device. Cover the generated deployment minimum and current public OS; generic “real iPhone/iPad” labels are not executable evidence.

| Surface | Real iPhone | iPad while supported |
| --- | --- | --- |
| Store install/update, launch, offline/reconnect | Required | Required; full-screen and multitasking widths |
| Signed-out Home/Solo/Multiplayer/legal links | Required | Required |
| Email/password and each shipped social login | Cold launch, cancel/error, browser return, relay/account linking where relevant, persistence | Same |
| Deep link | Valid callback, malformed/repeated callback, logout and cold start | Same |
| Solo/custom/proof/share/reset | Required | Clipping, keyboard and modal traps |
| Multiplayer/community | Create/join/leave/proof/report/block | Same |
| UGC safety | Filtering/rejection, queue delivery, removal and block coverage | Same |
| Trophy/account/support | Diagnostics default-off and exact preview | Same |
| Deletion | Failure preserves session; success deletes the entire account, associated personal data and shared UGC, discloses any lawful retention and completion timing, confirms completion, and signs out | Same |
| Privacy/network | Capture signed-out, signed-in, OAuth, proof, support and deletion traffic; reconcile label | Same |
| Accessibility | VoiceOver, Voice Control, Dynamic Type/Larger Text, focus, labels, contrast, Reduce Motion, touch targets | Same plus split-view overflow/focus |
| Appearance/layout | Dark/light if supported, portrait and every generated orientation | Same across materially different widths |

TestFlight acceptance also requires: processed build with no unresolved Missing Compliance status; correct name/icon/version/build/API; “What to Test”; internal group/build assignment; store-delivered installation; no debug endpoint; no secrets/tokens in logs; non-expiring review fixtures; public chess fixture; second-account multiplayer; background/foreground/forced relaunch; successful deletion and signed-out relaunch. External testing additionally requires Beta App Description, Feedback Email, Contact Information, and an internal group first. The first build added or submitted to an external testing group requires full TestFlight App Review; later builds for the same version may not. Read back each external-test field rather than assuming production review contact is reused. Record the build's 90-day expiry horizon. Internal testing, external TestFlight review, production App Review, approval, and public availability are separate states.

## 10. Least-privilege Apple access packet

Use a dedicated Crowdler/Sam Apple Account with MFA and Crowdler-controlled recovery. Do not use Andreas’s personal Apple identity. Apple access and Expo/EAS custody are separate gates.

### Exact owner action required now — discovery only

- **What Andreas must do:** confirm that the dedicated Crowdler/Sam Apple Account is the intended operational identity without pasting its address, and authorize that already-provisioned identity, only if it is already on the correct Crowdler AB team, to verify the legal entity, private team-identity match, membership status/expiry and role/app scope; search Apple Developer and App Store Connect for `com.sidequestchess.app`, Side Quest Chess, app records and SKUs; and report the highest existing iOS build number. Verify the Team ID privately against Crowdler's controlled record, but do not copy the Team ID into chat, logs, or repository artifacts.
- **Why:** a legal-team, duplicate, bundle-association and build-number readback is required before source freeze or any account-tied capability/signing work.
- **Deadline:** before authorizing the first Apple capability, credential, iOS cloud build, app-record mutation, or upload. No launch date is claimed.
- **Expected cost:** SEK 0 if membership/access already exist. Enrollment, renewal, invitation, acceptance, payment, agreement, tax, or banking action requires a separate approval.
- **Return receipt:** legal entity, confirmation that the privately compared team identity matched, membership status/expiry, confirmation that the dedicated operator identity matched, current role/app scope, duplicate-search results, App ID/app-record/SKU/bundle association, and highest build number; do not include the Team ID, Apple Account address, developer IDs, invitation URLs, or other security/personal data.
- **Stop conditions:** stop without accepting or changing anything if the identity is not already provisioned, the legal entity is not exactly Crowdler AB, a personal team is selected, Apple presents any agreement/attestation, access is broader than intended, a duplicate exists, or any fee is shown.
- **What it unblocks:** selecting a non-colliding build number and preparing later explicit approvals. It does not authorize invitation, capability, certificate/profile, record creation, build, upload, tester, submission, or release actions.

If invitation is later required, the approval packet must state the non-secret inviter/invitee roles, confirmation that the Crowdler AB team identity was privately matched, narrowest task-based role, app scope, Certificates/Identifiers/Profiles access if essential, cost, attestation/terms, and revocation owner; it must not retain account addresses, the Team ID, invitation URLs, or developer identifiers. For the eventual approved app-record/privacy workflow, the working proposal is app-scoped App Manager for Side Quest Chess only, but that role can add some users, so excluding user administration is an operating rule rather than a technically enforced least-privilege boundary. Confirm the live Apple roles table before invitation. Separately justify any Certificates, Identifiers & Profiles access: Apple states that granting it prevents app-level access limitation and exposes all app information, so it cannot coexist with strict Side Quest Chess-only scope. Exclude agreements, finance, reports, tax/banking and payments unless separately justified and approved. Discovery must not download or export existing certificates, provisioning profiles, API keys, or credentials. Developer can upload builds but does not satisfy all metadata/privacy duties, while broader roles carry mutation power.

## 11. Explicit approval boundaries

Written approval is required before:

- Apple Developer enrollment/renewal, payment, legal/tax/banking acceptance;
- creating or changing App IDs, capabilities, App Store Connect records, users, roles, certificates, profiles, keys, credentials, metadata, privacy/age answers, territories, pricing, or release settings;
- communicating externally. Andreas’s personal Apple identity is prohibited for this lane, not an approvable fallback;
- generating account-tied signing credentials, starting an account-authenticated iOS/EAS build, uploading, adding TestFlight groups/testers, submitting for beta or App Review, phased release, or public release.

Before upload, inspect the exact IPA for bundle ID, display name, approved version/build, URL scheme, production API, Crowdler signing team, intended entitlements, export declaration, embedded SDK/privacy manifests/signatures, and absence of unexpected advertising, tracking, purchase, location, camera, microphone, photo, contacts, or biometric capability.

Source freeze, archive, upload, TestFlight processing, store-delivered installation, smoke acceptance, production submission, review acceptance, release authorization, and verified public storefront availability are distinct receipts.

## 12. Verification receipt for this branch

- Strict TDD receipt for iOS support identity: RED failed because `mobileCandidateIdentity` did not exist; GREEN passed after the minimal platform-aware helper and UI integration.
- Strict TDD receipt for distribution-neutral iOS diagnostics: RED failed because iOS was labeled an App Store candidate from platform alone; GREEN passed after replacing that unverified channel claim with “iOS app build.” Android release identity now has native, managed-config, invalid-version and no-version regression coverage.
- Strict TDD receipt for cross-platform native generation: RED failed because the pull-request release gate had no iOS prebuild; GREEN passed after adding unsigned iOS generation and bounded cleanup before Android generation.
- Strict TDD receipt for native Apple login preparation: RED failed because the Expo capability/plugin, dependency, Clerk flow and native iOS buttons were absent; GREEN passed after the minimal integration. A post-change prebuild generated the expected Apple sign-in entitlement and the generated tree was removed.
- Strict TDD receipt for incomplete Apple account resolution: RED proved that a native result without an activatable session was silently ignored; GREEN now reports a recoverable sign-in error instead of leaving the user signed out without explanation.
- Strict TDD receipt for truthful deletion success copy: RED failed because the app promised that the account and saved data were permanently deleted despite documented backup/security-log retention; GREEN passed after limiting the confirmation to the verified account-deleted and signed-out result.
- Strict TDD receipt for post-deletion session cleanup: RED reproduced a completed deletion being reported as “Account not deleted” when sign-out failed; GREEN preserves deletion success, reports the cleanup limitation, and directs the user to close and reopen the app.
- Contract-test receipts now lock the required-reason API upload gate, immutable distribution choice, China mainland/Vietnam territory requirements, provider-specific SSO review-access rule, and Android/web predecessor launch-order gate after independent Apple-primary-source review.
- A direct local execution of the exact iOS prebuild command completed again on the current working tree, generated `com.sidequestchess.app` with version/build `0.1.349` / `1`, deployment target `15.1`, device family `1,2`, URL schemes `sidequestchess` and `com.sidequestchess.app`, ATS arbitrary loads disabled, and the expected Apple sign-in entitlement. No `.xcprivacy` file was generated before dependency installation. The generated tree was inspected and removed with no generated tracked change retained.
- `pnpm test`: PASS — 810 tests, 0 failures, 0 skipped/todo.
- `pnpm build`: PASS — Next.js production build completed.
- `pnpm --dir apps/mobile run typecheck`: PASS.
- `pnpm --dir apps/mobile run doctor`: PASS — 18/18 checks before native generation.
- `pnpm lint`: PASS with four pre-existing warnings and no errors (one unused variable and three `no-img-element` warnings).
- App Store field structural check: PASS — name 16/30, subtitle 28/30, promotional text 84/170, keywords 62/100 bytes (ASCII draft); public listing draft contains no “SQC”.
- iOS safety provenance TDD receipt: RED proved an `ios` safety request was stored as `website`; GREEN now sends the actual native platform and stores both `ios` and `android` as mobile evidence.
- Signed-out Support contact TDD receipt: RED proved the Support screen omitted direct Crowdler contact information; GREEN renders Crowdler AB, `sam@crowdler.com`, and Kvarnängsvägen 15, 182 47 Enebyberg, Sweden without requiring sign-in. Production deployment and readback remain separate gates.
- Apple authentication availability TDD receipt: RED proved the native Apple button was exposed from the platform name alone; GREEN now calls `AppleAuthentication.isAvailableAsync()` and exposes the button only after the current iOS environment confirms support.
- Apple cancellation TDD receipt: RED reproduced Clerk's normal canceled return shape being shown as a sign-in error; GREEN treats a missing session as cancellation after first verifying the Clerk sign-in/sign-up hooks are loaded, while still failing an activatable session that lacks `setActive`.
- Account-boundary TDD receipt: RED proved `MobileShell` persisted its authenticated account state across Clerk user changes; GREEN keys the shell to the exact Clerk user ID (or `signed-out`), discarding private account state and in-flight component work synchronously on logout or account switch.
- Password recovery TDD receipt: RED proved there was no recoverable mobile forgot-password path; GREEN now validates an account email, masks initiation failures to avoid exposing account existence, requests Clerk's reset code, verifies the code before displaying the new-password step, allows password-policy retries without reusing the code, calls reset with `signOutOfOtherSessions: true`, clears the password when leaving recovery or after success, and activates only a complete replacement session. A follow-up RED proved that network/rate-limit failures and unexpected Clerk states were falsely presented as successful code delivery; GREEN now masks only Clerk's explicit unknown-identifier response and shows a retryable delivery failure for other errors. MFA continuation is a known unsupported source path; exact-candidate provider delivery, session revocation and iPhone rendering remain not verified.
- Privacy safety-data TDD receipt: RED proved the public policy omitted report/block handling and deletion behavior; GREEN discloses stored report/block identifiers, reasons, timestamps, source, current account attachment, block purpose, and deletion behavior. Independent review then found that the first draft omitted the asymmetry between deleting a reporter/blocker and deleting a reported/blocked account; a new RED locked that behavior and GREEN now states that references in other users' safety records are not currently removed. A separate contract RED proved the packet still described those disclosures as absent; GREEN now distinguishes source preparation from blocked production deployment/readback.
- Independent review found no credential exposure or unauthenticated deletion path. It did identify Apple authorization-token revocation during deletion as a blocking source/integration gap; that finding is now explicit in the gate ledger and safe-source backlog rather than deferred to device QA.
- Independent installed-API review confirmed that Clerk's current external-account destroy/delete APIs only prove unlinking and expose no provider-agnostic revocation contract; the native Clerk Apple hook also does not expose the Apple authorization code needed for a complete revocation flow. Google/Facebook and Apple provider revocation therefore remain fail-closed integration gates rather than being mislabeled as solved by Clerk user deletion.
- Signed-in account-unavailable TDD receipt: RED reproduced an account-service failure being reduced to the signed-out fallback while Clerk remained authenticated, hiding deletion/logout and presenting social/password sign-in. GREEN preserves an explicit authenticated recovery surface with retry, deletion, logout and support controls; targeted account/deletion tests, mobile typecheck and the full suite pass.
- A fresh independent packet/source review also identified the app-record Made for Kids, User Access, copyright, archive-icon, privacy-policy report/block disclosures, concrete least-privilege role, and exact-device matrix as unresolved facts. This packet now approval-gates each one rather than inferring it from source configuration.
- Keyboard-safety TDD receipt: the source-contract RED proved that the root, shared form, and three nested horizontal filter scroll containers lacked the properties that preserve the first submit/filter tap while a keyboard is open, and that the vertical containers did not request automatic iOS keyboard insets; GREEN now preserves handled keyboard taps across those containers and enables iOS keyboard insets on the two vertical containers. Real-iPhone and iPad interaction behavior remains device-blocked and is not claimed by this source receipt.
- Current Apple metadata contract TDD receipt: RED proved the packet omitted South Korea's separate availability/RCN property and the September 2026 social-media-question deadline; GREEN now fail-closes both and requires live response readback.
- Social SSO cancellation TDD receipt: RED reproduced Google/Facebook browser `cancel` and `dismiss` returns reaching the incomplete-sign-in alert; GREEN now treats those user cancellations as non-errors, still activates a created Clerk session, and preserves diagnostics for a non-canceled incomplete return. Exact-candidate callback behavior remains a physical-device gate.
- `git diff --check`: PASS.
- `pnpm mobile:release:check` on a managed checkout cannot start because that script assumes a generated Android manifest. Its earlier disposable generated-checkout receipt stopped before CocoaPods was installed; that stale tooling blocker has now been superseded by the direct CocoaPods/native-build receipt below. Expo Doctor's warning that checked-in native folders change config-sync behavior remains applicable, so the generated tree was not adopted as source.
- Historical local native narrative receipt at resolvable branch commit `f628e8321608d966fe2230837ed6c24fc442ebe3`: Xcode 26.6 with the iOS 26.5 SDK and registered iOS 26.5 (`23F77`) runtime; CocoaPods 1.17.0; `pod install` was reported PASS with 85 dependencies/84 pods; the aggregate generated privacy manifest was reported inspected; and the reported scheme/configuration identity was `SideQuestChess` / Release, bundle `com.sidequestchess.app`, version/build `0.1.349` / `1`, deployment target `15.1`, device family `1,2`, URL schemes `sidequestchess` and `com.sidequestchess.app`. An exact-destination unsigned Release Simulator build was reported passing on iPhone 17 Pro / iOS 26.5 with a bundled `main.jsbundle`. No code-signing identities were installed, so this was not a signed candidate or archive. The build log, generated inventory, capture, and `.xcresult` were not preserved as a repository evidence artifact; treat this as a narrative receipt, not independently reproducible final-candidate evidence.
- The commit-`f628e8321608d966fe2230837ed6c24fc442ebe3` unsigned Release Simulator app was reported installed and launched as PID `69152` on iPhone 17 Pro (`94D16E18-197E-43FD-A133-572FF0A7FBE4`) / iOS 26.5. The reported readback was display name `Side Quest Chess`, bundle `com.sidequestchess.app`, version/build `0.1.349` / `1`, and capture dimensions `1206×2622`; earlier narrative evidence also described launches on iPad mini (A17 Pro) and iPad Pro 13-inch (M5). Current `origin/main` subsequently changed the desktop web shell/CSS and web tests, and this branch subsequently changed native social-SSO completion, so that historical app is not the exact current source tree. These claims have no preserved repository capture/log artifact and cannot serve as approved App Store screenshots or responsive interaction acceptance; repeat and preserve the evidence for the frozen candidate.
- Latest native-build receipt for commit `ee1c7d68` (the commit containing the Google/Facebook cancellation fix): direct iOS prebuild and CocoaPods 1.17.0 installation passed with 85 dependencies/84 pods. The generated `SideQuestChess` workspace exposed the expected scheme, bundle `com.sidequestchess.app`, version/build `0.1.349` / `1`, deployment target `15.1`, device family `1,2`, URL schemes `sidequestchess` and `com.sidequestchess.app`, and Apple sign-in entitlement. The aggregate app privacy manifest again declared tracking `false`, no native collected-data rows, and the previously inventoried required-reason categories; this remains reconciliation evidence, not a final privacy answer. With Xcode 26.6 and iOS 26.5 (`23F77`), an exact-destination unsigned Release Simulator build passed for iPhone 17 Pro (`94D16E18-197E-43FD-A133-572FF0A7FBE4`), installed, and launched as PID `12706`. Built-app readback returned `Side Quest Chess`, `com.sidequestchess.app`, and `0.1.349` / `1`; a `1206×2622` capture OCR found the expected Side Quest Chess signed-out screen. The generated native tree was removed and the simulator shut down. This is commit-specific local source-compilation and launch evidence only—not exact-current-source, signing, archive, TestFlight, responsive interaction, SSO callback, or physical-device evidence.
- Complete Simulator UI/interaction tests, `.xcresult`, signed archive, signing, TestFlight and physical-device smoke: NOT PASSED / BLOCKED by the separate Apple identity, account, signing and approval gates plus unresolved source/integration gates. No signed archive, TestFlight build, or physical-iPhone evidence exists.

## 13. Authoritative Apple references to re-check at execution time

- App Review Guidelines 4.8: https://developer.apple.com/app-store/review/guidelines/
- App information: https://developer.apple.com/help/app-store-connect/reference/app-information/
- Platform version information and Support URL requirements: https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/
- Age rating: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/
- App privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Export compliance: https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/
- Screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Apple Developer/App Store Connect roles: https://developer.apple.com/help/account/access/roles/
- Upload toolchain requirement effective 2026-04-28: https://developer.apple.com/news/upcoming-requirements/?id=04282026a
- DSA trader requirements: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements
- Age-rating values and definitions: https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/
- Required App Store Connect properties, including Republic of Korea availability: https://developer.apple.com/help/app-store-connect/reference/app-information/required-localizable-and-editable-properties
- App information and South Korea RCN criteria: https://developer.apple.com/help/app-store-connect/reference/app-information/app-information
- September 2026 social-media age-rating questions: https://developer.apple.com/news/?id=tlur8uvi
- iPhone/iPad app availability on Apple-silicon Mac: https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-of-iphone-and-ipad-apps-on-macs-with-apple-silicon
- iPhone/iPad app availability on Apple Vision Pro: https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-of-iphone-and-ipad-apps-on-apple-vision-pro
