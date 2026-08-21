# Side Quest Chess — iOS App Store release-preparation packet

**Prepared:** 2026-08-21<br>
**Source baseline:** `5e99adda9a1632642e2f611f115b6db68064746a` (`origin/main`, fetched immediately before this change)<br>
**Status:** Drafts and verified source audit only. This is not an App Store Connect record, Apple credential, IPA, TestFlight build, review submission, approval, or public release.

This packet supersedes the iOS portions of `SQC_MOBILE_APPLE_PRIVACY_PREP_2026-07-03.md`, `SQC_MOBILE_STORE_LAUNCH_PREP_2026-07-07.md`, and `SQC_MOBILE_STORE_SUBMISSION_PACK_2026-07-07.md` for this source baseline.

## 1. Verified baseline and blockers

- Current source: Expo version `0.1.349`; Android source version code `349`.
- Android launch evidence is separate: repository receipts describe `0.1.349 (350)` on Google Play Internal testing. This lane did not read Play Console or claim Android public launch.
- Public identity: **Side Quest Chess**. Do not use “SQC” in public copy.
- Bundle ID candidate: `com.sidequestchess.app`; Expo scheme: `sidequestchess`; native callback: `sidequestchess://sso-callback`.
- Publisher/controller target: Crowdler AB. Worldwide 13+ target. No ads, IAP, subscriptions, or real-money prizes.
- `supportsTablet` is `true`; iPad build, responsive QA, and screenshots are therefore release gates.
- Source offers email/password, Google, and Facebook login. It does **not** offer Sign in with Apple or declare its capability. Apple Review Guideline 4.8 therefore remains a source blocker unless the final login set qualifies for a documented exception.
- No deliberate iOS build number is source-controlled. A disposable clean prebuild currently defaults to build `1`; this is not proof that `1` is available in App Store Connect. No final privacy manifest report, signed IPA, TestFlight build, or physical-iPhone callback proof exists.
- The live Support page is reachable, but its signed-out rendering does not expose Crowdler AB's legal address, email address, or telephone number. Apple requires the Support URL to lead to actual contact information as required by local law, so the listing remains blocked until this is corrected and re-read from production.
- Full Xcode is unavailable locally: `/Library/Developer/CommandLineTools` is selected and `xcodebuild` rejects it. No valid local Apple signing identity is verified.
- EAS is associated with owner `and72nor`; the verified authenticated identity is Andreas’s personal identity. Do not use it for Apple access, credentials, build, or submission.

### Disposable native-generation receipt

A clean detached worktree at the stated source baseline completed `expo prebuild --platform ios --no-install` on 2026-08-21 without Apple access or signing. The generated project was inspected and discarded; it was not adopted as release source.

- Generated display name: `Side Quest Chess`.
- Generated plist short version/build: `0.1.349` / `1`; project build settings also contain `MARKETING_VERSION = 1.0`, so the archive plist—not a single project setting—must control final identity review.
- Bundle ID: `com.sidequestchess.app`; targeted device family: `1,2`; deployment target: iOS `15.1`.
- URL schemes: `sidequestchess` and `com.sidequestchess.app`.
- App entitlements dictionary: empty. This confirms Sign in with Apple is not configured in generated current-main source.
- ATS: arbitrary loads `false`; local networking `true`. The narrow local-network allowance and all production endpoints still require archive/network review.
- iPhone orientations: portrait and upside-down. iPad orientations: portrait, upside-down and both landscapes; `UIRequiresFullScreen = false`, so multitasking widths are a required QA seam.
- No sensitive-resource usage description appeared in the generated Info.plist.
- No `.xcprivacy` file existed immediately after `--no-install`. This does not inspect CocoaPods/transitive SDK manifests and is not an aggregate privacy report.
- Full Xcode/CocoaPods compilation, archive inspection, signing and Simulator/device launch remain blocked.

## 2. Fail-closed gate ledger

| Gate | State | Required evidence |
| --- | --- | --- |
| Crowdler AB Apple legal team | Blocked | Legal entity, Team ID, membership status/expiry |
| Dedicated Crowdler/Sam operator | Blocked | Exact Apple Account, MFA/recovery custody, role and app scope; never Andreas’s personal identity |
| Bundle/app reconciliation | Blocked | Apple Developer and App Store Connect searches for `com.sidequestchess.app`, including duplicate/App ID/app record/SKU results |
| Source freeze | Not frozen | Clean approved commit, lockfile hash, approved version and unique build number |
| Guideline 4.8 login | Blocked | Sign in with Apple implementation/configuration or documented exception; account linking, cancellation, relay email, revocation and deletion tests |
| Generated native audit | Blocked | Clean prebuild diff; Info.plist, entitlements, URL types, deployment target, SDKs and privacy manifests |
| Signed candidate | Blocked | IPA hash, identity/version/build, Crowdler signature/team, entitlements and export-compliance inspection |
| Privacy labels | Draft only | Backend/provider/SDK/manifest/network reconciliation against exact IPA |
| Age rating / 13+ access | Draft only | Live questionnaire receipt and owner/legal-approved 13+ eligibility behavior |
| Screenshots | Blocked | Fresh same-candidate iPhone and iPad captures |
| Support URL contact | Blocked | Production signed-out page exposes the required legal address, email and telephone contact and accepts issue/feedback contact |
| TestFlight | Not started | Approved upload, tester configuration and store-delivered install receipt |
| Real iPhone smoke | Blocked | Exact TestFlight build, signed-out and signed-in flows, callback and deletion |
| Review submission | Not started | Separate approval and App Store Connect readback |
| Public release | Not started | Separate approval and storefront availability readback |

## 3. Safe source work still required

Use strict RED–GREEN–REFACTOR for each behavior change and preserve failing-test output before implementation.

1. Add an equivalent Apple login path for iOS, including Expo capability/plugin configuration, Clerk/provider wiring, account linking, cancellation/error behavior, relay-email handling, and authorization/token revocation as part of deletion. Do not create the Crowdler App ID capability or provider credentials without approval.
2. Add a deliberate iOS build-number policy after reading the highest existing App Store build number.
3. Decide and verify exempt-encryption handling against the generated archive. Current source has no `usesNonExemptEncryption` declaration; do not answer from dependency names alone.
4. Keep the new pull-request iOS source gate green: it generates an unsigned iOS project from Expo config, removes the generated tree, then continues with Android generation and managed-config checks. This catches prebuild regressions without Apple credentials, but it does not prove CocoaPods, Xcode compilation, signing, archive contents or device behavior. For a release candidate, repeat native generation in a clean frozen worktree and immediately inspect the complete diff, generated Info.plist/entitlements/URL types, all usage descriptions, deployment target, iPad orientations, ATS settings, SDK privacy manifests, required-reason APIs, and SDK signatures.
5. Resolve tablet policy: retain support only after iPad responsive acceptance and screenshots, or seek explicit product approval to disable it before freeze.
6. Reconcile the privacy policy and nutrition label with Clerk, Google, Facebook, Apple if added, hosting/security logs, Expo runtime, optional support diagnostics, Lichess/Chess.com public-record retrieval, and all transitive native SDK behavior.
7. Platform-aware support identity is now implemented on this branch: iOS reports the bundle ID and native version/build under the distribution-neutral label “iOS app build,” without claiming an App Store/TestFlight channel, Android APK, or GitHub release. Preserve the identity regression tests and verify the rendered diagnostics on the selected TestFlight build.

## 4. App Store listing draft — English (U.S.)

These are proposed values only; adopting them in App Store Connect is approval-gated.

| Field | Draft |
| --- | --- |
| Name | Side Quest Chess |
| Subtitle | Turn chess games into quests |
| Primary language | English (U.S.) |
| SKU | `sidequestchess-ios` — owner must approve before immutable record creation |
| Primary category | Games |
| Games subcategories | Board; Strategy |
| Price | Free |
| Copyright | 2026 Crowdler AB |
| Privacy Policy URL | https://sidequestchess.com/privacy |
| Support URL | https://sidequestchess.com/support |
| Marketing URL | https://sidequestchess.com |
| Terms | https://sidequestchess.com/terms |
| Release method | Manual release |
| Phased release | Off for version 1 unless separately approved |
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

Before adoption, verify the live field limits, unique name/SKU, territories, content rights, EU trader status, tax category, version/build, review contact, accessibility declarations, and whether “What’s New” is required. “Worldwide” specifically requires either the applicable game approvals for China mainland and Vietnam or explicit exclusion of those storefronts before submission.

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
| Diagnostics / Other Diagnostic Data | App Functionality | Optional support bundle: application ID, app version/build, OS/platform, API destination, account/display-name state, chess handles, active solo quest, multiplayer/public-hosted counts and timestamp |

Unresolved before adoption: IP address, user agent, session/device identifiers, hosting/security logs, crashes/performance, retention/deletion periods, processor purposes, SDK-collected data, and provider-specific behavior. Optional diagnostics remain collected when submitted. Inspect the archive’s SDK inventory, privacy manifests, aggregate privacy report, required-reason APIs and SDK signatures. The app’s own manifest cannot repair a missing third-party SDK manifest. Reconcile at the App Store Connect app-record level as well as against the IPA because Apple privacy answers apply across all Apple platforms associated with that app record.

## 6. Age-rating draft

The contractual minimum age is 13; Apple’s calculated regional rating is separate. Preserve the exact live questionnaire version, every answer, calculated global/regional ratings, and any override. If the EULA minimum age is above Apple's calculated rating, apply Apple's required qualifying higher-rating override. A storefront override does not enforce account eligibility, so the in-app 13+ eligibility behavior remains a separate owner/legal decision and candidate gate.

Working answers:

- Advertising: No
- Gambling, simulated gambling, loot boxes: No / None
- Parental Controls: No
- Age Assurance: No — release blocker for the intended 13+ social/UGC service until owner/legal approves and the candidate verifies an eligibility approach
- Unrestricted Web Access: No; only specific auth, legal, support, and public-proof destinations
- User-Generated Content: Yes
- Social Media: Yes — public discovery/posting, likes, profiles and creator attribution
- Messaging and Chat: Yes if Apple’s live definition includes reachable public posting
- Contests: Yes under Apple's current definition because users compete for rankings and personal goals; select frequency only from verified live-candidate evidence. There is no money or prize.
- Profanity, mature themes, drugs, sexual content, violence and weapons: publisher-authored content is intended None, but reachable UGC must be moderated and audited before selecting frequencies

Verify report, block, filtering, moderation queue, response/removal process, and every Community surface. Do not infer the final storefront rating from this draft.

## 7. Review notes draft

Do not paste until every statement passes on the selected TestFlight build.

> Side Quest Chess lets players choose solo or multiplayer chess challenges and check results against public games associated with a configured Lichess or Chess.com username. The app does not request or store chess-site passwords and is independent from those services.
>
> Signed-out public areas: [list only exact surfaces verified on the submitted build]. Sign-in is required for account-backed progress, proof checks, creation/joining, support messages, safety controls, and account deletion.
>
> Safety: [state exact verified report, block, moderation, and response behavior; do not promise unstaffed operations].
>
> To delete an account: My Account → Delete account → type `DELETE MY ACCOUNT` → Permanently delete account. The app signs out after deletion succeeds. [Retain only after complete data-deletion/retention verification.]
>
> Login methods verified on this build: [list only methods that pass exact-candidate physical-iPhone smoke]. Social login returns through `sidequestchess://sso-callback`.
>
> Support: https://sidequestchess.com/support<br>
> Privacy: https://sidequestchess.com/privacy

Create owner-authorized, non-personal primary/secondary review fixtures plus a deletion-only fixture. Put the non-expiring primary username/password in Apple's credential fields and secondary/deletion fixture details in Review Notes; do not place credentials in source or this packet. Read back the review contact name, email and international-format phone, and keep Review Notes within Apple's live byte limit. Include seeded IDs, expected proof result, reset instructions, fallback route, reachable review contact, and an owner monitoring auth/API/provider/moderation/deletion services throughout review. Recreate the deletion fixture after smoke.

## 8. Screenshot and localization plan

Capture fresh images from the exact selected build with non-personal, truthful data. Initial locale: English (U.S.). Add localizations only with reviewed field copy and asset inheritance.

- iPhone: 6.9-inch portrait at `1260×2736`, `1290×2796`, or `1320×2868`; 1–10 frames with no alpha. If a 6.9-inch set is not supplied, Apple's current fallback requires a 6.5-inch set at `1284×2778` or `1242×2688`. Proposed order: Home/selection, quest detail/proof, multiplayer, community, Trophy Cabinet, account/support.
- iPad: while `supportsTablet` remains enabled, supply a required 13-inch set: portrait `2064×2752` or `2048×2732`; landscape `2752×2064` or `2732×2048`. Capture equivalent truthful tablet frames and re-read Apple's specification at capture time.
- Re-verify all exact pixel dimensions and accepted fallback sizes in live Apple documentation at capture time.
- Manifest each file with source SHA, version/build, build ID, device/display, OS, orientation, locale, fixture, dimensions, filename, and SHA-256.
- Reject stale names, debug overlays, personal data, fake achievements, pricing, clipping, and keyboard/modal residue. App preview is optional.

## 9. Same-candidate QA matrix and TestFlight smoke

Record device, OS, source SHA, version/build, TestFlight build ID, fixture, timestamp, result, and evidence. Cover the generated deployment minimum and current public OS.

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
| Deletion | Failure preserves session; success deletes/anonymizes approved scope and signs out | Same |
| Privacy/network | Capture signed-out, signed-in, OAuth, proof, support and deletion traffic; reconcile label | Same |
| Accessibility | VoiceOver, Voice Control, Dynamic Type/Larger Text, focus, labels, contrast, Reduce Motion, touch targets | Same plus split-view overflow/focus |
| Appearance/layout | Dark/light if supported, portrait and every generated orientation | Same across materially different widths |

TestFlight acceptance also requires: processed build with no unresolved Missing Compliance status; correct name/icon/version/build/API; “What to Test”; internal group/build assignment; store-delivered installation; no debug endpoint; no secrets/tokens in logs; non-expiring review fixtures; public chess fixture; second-account multiplayer; background/foreground/forced relaunch; successful deletion and signed-out relaunch. External testing additionally requires Beta App Description, Feedback Email, an internal group first, and first-build TestFlight App Review approval. Record the build's 90-day expiry horizon. Internal testing, external TestFlight review, production App Review, approval, and public availability are separate states.

## 10. Least-privilege Apple access packet

Use a dedicated Crowdler/Sam Apple Account with MFA and Crowdler-controlled recovery. Do not use Andreas’s personal Apple identity. Apple access and Expo/EAS custody are separate gates.

### Exact owner action required now — discovery only

- **What Andreas must do:** confirm in writing the dedicated Crowdler/Sam Apple Account address and authorize that already-provisioned identity, only if it is already on the correct Crowdler AB team, to read the legal entity, Team ID, membership status/expiry and role/app scope; search Apple Developer and App Store Connect for `com.sidequestchess.app`, Side Quest Chess, app records and SKUs; and report the highest existing iOS build number.
- **Why:** a legal-team, duplicate, bundle-association and build-number readback is required before source freeze or any account-tied capability/signing work.
- **Deadline:** before authorizing the first Apple capability, credential, iOS cloud build, app-record mutation, or upload. No launch date is claimed.
- **Expected cost:** SEK 0 if membership/access already exist. Enrollment, renewal, invitation, acceptance, payment, agreement, tax, or banking action requires a separate approval.
- **Return receipt:** legal entity, Team ID, membership status/expiry, operator address, current role/app scope, duplicate-search results, App ID/app-record/SKU/bundle association, highest build number; redact security and personal data.
- **Stop conditions:** stop without accepting or changing anything if the identity is not already provisioned, the legal entity is not exactly Crowdler AB, a personal team is selected, Apple presents any agreement/attestation, access is broader than intended, a duplicate exists, or any fee is shown.
- **What it unblocks:** selecting a non-colliding build number and preparing later explicit approvals. It does not authorize invitation, capability, certificate/profile, record creation, build, upload, tester, submission, or release actions.

If invitation is later required, the approval packet must state inviter, invitee, exact Crowdler AB Team ID, narrowest task-based role, app scope, Certificates/Identifiers/Profiles access if essential, cost, attestation/terms, and revocation owner. Exclude user administration, agreements, finance, reports, tax/banking and payments unless separately justified and approved. Re-check Apple’s live roles table before invitation; Developer can upload builds but does not satisfy all metadata/privacy duties, while broader roles carry mutation power.

## 11. Explicit approval boundaries

Written approval is required before:

- Apple Developer enrollment/renewal, payment, legal/tax/banking acceptance;
- creating or changing App IDs, capabilities, App Store Connect records, users, roles, certificates, profiles, keys, credentials, metadata, privacy/age answers, territories, pricing, or release settings;
- using Andreas’s personal Apple identity or communicating externally;
- generating account-tied signing credentials, starting an account-authenticated iOS/EAS build, uploading, adding TestFlight groups/testers, submitting for beta or App Review, phased release, or public release.

Before upload, inspect the exact IPA for bundle ID, display name, approved version/build, URL scheme, production API, Crowdler signing team, intended entitlements, export declaration, embedded SDK/privacy manifests/signatures, and absence of unexpected advertising, tracking, purchase, location, camera, microphone, photo, contacts, or biometric capability.

Source freeze, archive, upload, TestFlight processing, store-delivered installation, smoke acceptance, production submission, review acceptance, release authorization, and verified public storefront availability are distinct receipts.

## 12. Verification receipt for this branch

- Strict TDD receipt for iOS support identity: RED failed because `mobileCandidateIdentity` did not exist; GREEN passed after the minimal platform-aware helper and UI integration.
- Strict TDD receipt for distribution-neutral iOS diagnostics: RED failed because iOS was labeled an App Store candidate from platform alone; GREEN passed after replacing that unverified channel claim with “iOS app build.” Android release identity now has native, managed-config, invalid-version and no-version regression coverage.
- Strict TDD receipt for cross-platform native generation: RED failed because the pull-request release gate had no iOS prebuild; GREEN passed after adding unsigned iOS generation and bounded cleanup before Android generation.
- A direct local execution of the exact iOS prebuild command completed, generated `com.sidequestchess.app` with deployment target `15.1` and device family `1,2`, and the generated tree was removed. No tracked package or lockfile change remained.
- `pnpm test`: PASS — 760 tests, 0 failures, 0 skipped/todo.
- `pnpm build`: PASS — Next.js production build completed.
- `pnpm --dir apps/mobile run typecheck`: PASS.
- `pnpm --dir apps/mobile run doctor`: PASS — 18/18 checks before native generation.
- `pnpm lint`: PASS with four pre-existing warnings and no errors (one unused variable and three `no-img-element` warnings).
- App Store field structural check: PASS — name 16/30, subtitle 28/30, promotional text 84/170, keywords 62/100 bytes (ASCII draft); public listing draft contains no “SQC”.
- `git diff --check`: PASS.
- `pnpm mobile:release:check` on a managed checkout cannot start because that script assumes a generated Android manifest. In the disposable generated checkout it progressed through the production dependency audit, then stopped because CocoaPods is unavailable and Expo Doctor correctly warns that checked-in native folders change config-sync behavior. This is not an iOS release pass and no workaround was applied.
- Full Xcode build, CocoaPods install, Simulator tests, `.xcresult`, archive, signing, TestFlight and device smoke: NOT RUN / BLOCKED by the verified local prerequisites and approval gates.

## 13. Authoritative Apple references to re-check at execution time

- App Review Guidelines 4.8: https://developer.apple.com/app-store/review/guidelines/
- App information: https://developer.apple.com/help/app-store-connect/reference/app-information/
- Platform version information and Support URL requirements: https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/
- Age rating: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/
- App privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Export compliance: https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/
- Screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Apple Developer/App Store Connect roles: https://developer.apple.com/help/account/access/roles/
