# Side Quest Chess — Google Play public Production launch packet for code 350

Prepared: 2026-08-13

Status: **READY FOR OWNER DECISION, FAIL-CLOSED AT PLAY CONSOLE AND LEGAL/DECLARATION READ-BACK**

This is the one production-launch packet for the already published Internal-testing release. It does not create a new build, upload, tester change, or Play Console mutation. No production mutation is authorized by this document.

## 1. Immutable release identity

| Field | Exact value |
|---|---|
| Existing app | Side Quest Chess |
| Publisher | Crowdler AB |
| Package | `com.sidequestchess.app` |
| Release | `0.1.349` / version code `350` |
| Immutable source | `189c93a350eb48d2a325f3a3f4edd99ed110c4b5` |
| EAS build | `462821e5-6e2a-47c2-bfb8-0c2debcb0e34` (`production` / `STORE`) |
| Frozen AAB | `/Users/sam/Projects/sqc-worktrees/mobile-icon-code350-play/apps/mobile/artifacts/android/mobile-v349-code350/side-quest-chess-android-v349-code350.aab` |
| AAB SHA-256 | `8003d55e46ed443dd34a9a9a6778334e5abf50081b417fd98685a2620778d01c` |
| AAB size | `85,617,302` bytes |
| Upload-certificate SHA-256 | `891fdc5a80601eaa2b6db1f3fcb26ab756650179b40b3a3f5f58dd921d753cf2` |
| Production API | `https://sidequestchess.com` |

The Play app-signing certificate is distinct from the upload certificate and must be read back from **App integrity** during the authorized Console transaction. Andreas has enrolled, installed, launched, and approved this Play-delivered release and launcher logo on a Samsung Galaxy S24 Ultra. Code 350 is active on Internal testing. Do not upload code 350 again, rebuild identical bytes, or create code 351 merely for publication.

Exactly two Internal testers remain approved: `samnordbot@gmail.com` and `andreas.nordenadler@gmail.com`. Do not add or remove testers during Production launch.

## 2. Immutable store listing and graphics

Use the existing English listing copy in `docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md`, with candidate references superseded by this code-350 packet. The customer-facing copy remains:

- App name: **Side Quest Chess**
- Short description: **Turn chess games into playful Side Quests with proof checks and trophy rewards.**
- Full description: the exact paste-ready body in that listing document

Upload or retain only this graphics set:

| Asset | Required identity |
|---|---|
| Store icon | `apps/mobile/store-assets/google-play/store-icon-512.png` — 512 × 512 RGBA PNG — SHA-256 `dece7654e1346e799a4ee39f4f1bc4dc399bf138ca96e2fea069d56e3d6a25e2` |
| Feature graphic | `apps/mobile/store-assets/google-play/feature-graphic-1024x500.png` — 1024 × 500 RGB PNG — SHA-256 `f89001e2662f29196a53170a8ef2f1f2b8117dc134b71351b54550934e810fe2` |
| Phone screenshot 1 | `apps/mobile/store-assets/google-play/code350-phone-screenshots/01-choose-a-solo-side-quest.png` — 1080 × 1920 RGBA PNG — SHA-256 `7c7093ec7c32f53628642d5982342c6b74e37585a178369926e9c9b781aa08ce` |
| Phone screenshot 2 | `apps/mobile/store-assets/google-play/code350-phone-screenshots/02-see-the-rules-and-reward.png` — 1080 × 1920 RGBA PNG — SHA-256 `daec0a3dbe9c6e93601b943027f27054591569b9917f23bb2e0b196f5ab4ec1f` |
| Phone screenshot 3 | `apps/mobile/store-assets/google-play/code350-phone-screenshots/03-play-multiplayer-side-quests.png` — 1080 × 1920 RGBA PNG — SHA-256 `3435d056c1acc5fb61962863e1853b1e853edeef0bb31f9b12469a0219f0ec4d` |

The icon and feature graphic are reviewed original product compositions with recorded repository provenance. The three phone screenshots meet the preferred 9:16 1080 × 1920 dimensions, but screenshot provenance is not yet proven: the current evidence does not bind their capture to the Play-delivered code-350 install, installer `com.android.vending`, Play app-signing identity, device, or capture date. Do not upload the phone screenshots until an authorized read-back records those facts or a replacement set is captured from the verified Play-delivered code-350 install and independently reviewed. Screenshot 3 contains a dynamic “4d left” label; require a same-day visual check that the countdown or other time-sensitive state is still truthful on submission day, otherwise replace and re-review that image. During the authorized transaction, require Play to accept each approved file and inspect the final rendered listing preview before submission; stop on cropping, unreadable copy, private data, stale state, or a validation warning.

## 3. Fixed public store posture

| Store fact | Exact posture |
|---|---|
| Countries / regions | Worldwide |
| Audience | 13+; not directed to children under 13 |
| Pricing | Free |
| Ads | No ads |
| In-app purchases | No in-app purchases |
| Subscriptions | No subscriptions |
| Gambling / prizes | No real-money prizes |
| Governing law | Swedish law |
| Publisher | Crowdler AB |
| Support / privacy / moderation | `sam@crowdler.com` |
| Website | `https://sidequestchess.com` |
| Privacy policy | `https://sidequestchess.com/privacy` |
| Terms of Use | `https://sidequestchess.com/terms` |
| Category | Game → Board |

No country exclusion, paid conversion, ad/IAP/subscription configuration, tester mutation, account change, or legal-fact substitution is in scope.

## 4. Declaration and policy readiness — mandatory live read-back

The prior declaration draft at PR #105 is useful historical evidence but is stale at code 349 and intentionally unmerged. Its unresolved facts must not be copied blindly. Before Production submission, open each current Play Console form and reconcile the live wording against code 350:

1. **Data safety:** disclose account/profile identifiers, email, public chess usernames and game/proof state, user-generated quest/participation content, support/report text, optional diagnostics, and bounded first-party app interactions. Confirm encrypted-in-transit and processor/sharing classifications from current production providers. Do not claim advertising-ID, payment, location, contacts, camera, microphone, health, SMS, or file collection without contrary live SDK evidence.
2. **App access:** declare that some functionality requires sign-in; public Solo and Multiplayer catalogs are browsable signed out. Enter one working disposable reviewer account and access instructions only in Play Console protected fields. Never place credentials in Git, this packet, screenshots, or chat.
3. **Content rating:** answer the live IARC questionnaire from the factual posture: abstract chess; no product-authored violence, sexual content, profanity, drugs, horror, gambling, purchases, ads, or prizes; user-generated quest text and bounded shared participation/content are present. Accept only the rating calculated by Play; do not predeclare it.
4. **Target audience:** select 13–15, 16–17, and 18 and over; do not select under-13 bands and do not enroll in Families.
5. **Ads / financial / health / government / news declarations:** No ads; no financial features; not a health app; not a government app; not a news app.
6. **Privacy policy and account deletion:** require the public privacy URL and signed-in in-app deletion flow to pass Console validation. Read the live pages before submission.
7. **User-generated content and moderation:** declare UGC truthfully. Confirm report/block entry points, the operable moderation delivery route to `sam@crowdler.com`, prohibited-content handling, and removal/escalation ownership against Play's current wording.
8. **Play Console production availability:** verify the Production track can receive a promotion of code 350 and record every blocking task, warning, managed-publishing state, and review requirement verbatim.

### Fail-closed legal/policy boundary

The currently merged `/privacy` and `/terms` source still labels itself a launch draft, exposes the older `andreas.nordenadler@gmail.com` contact, and says key controller/age/legal facts are unresolved. The owner-supplied launch posture is Crowdler AB, age 13+, Swedish law, and `sam@crowdler.com`, but green engineering checks do not legally adopt those statements. Therefore the Production transaction must stop without submission unless the live public pages and current Console declarations are already corrected/adopted, or Andreas explicitly approves their adoption through a separately reviewed legal/policy change. Do not manufacture an effective date, address, transfer mechanism, retention period, moderation SLA, or legal exception.

## 5. Exact authorized Production transaction

After every blocker above is closed and the exact owner approval phrase below is received:

1. Open the existing Side Quest Chess app; confirm package and publisher.
2. Read back **App integrity**, Play app-signing certificate, Internal code 350 state, exact two-tester roster, and Production state.
3. Confirm no version above 350 exists and no pending change replaces this packet.
4. Complete/save every required App content declaration and read each answer back.
5. Complete the Main store listing with the exact copy/assets above; select Worldwide availability.
6. Create the Production release: promote the unchanged code-350 Internal release to Production. Do not upload code 350 again.
7. Set rollout to **100% of eligible users in all selected worldwide countries/regions**. This is a public launch, not another test and not a partial private cohort.
8. Use release name `0.1.349 (350)` and release notes: **Initial public release of Side Quest Chess on Android. Choose Solo Side Quests, verify public chess games, join Multiplayer challenges, and collect Coats of Arms.**
9. Review the release summary, countries, declarations, listing preview, managed-publishing status, warnings, and errors. Stop on any mismatch or unresolved blocker.
10. Enumerate the packet-owned pending changes: the code-350 Production promotion, Worldwide availability, exact listing copy and approved assets, and the declarations reviewed in this transaction. Submit only the enumerated packet-owned changes for Google review. Stop if Play groups any unrelated pending change into the submission; do not submit or discard that unrelated change.
11. Read back and record the exact Production state and review timestamp without claiming more than Play reports.

State language is strict:

- **Submitted:** Play accepted the Production transaction.
- **Under review:** Google review is pending; the app is not yet publicly launched.
- **Approved / ready to publish:** review passed but managed publishing or another publish control still prevents availability.
- **Publicly installable:** a signed-out/new-user Play Store check in a supported worldwide region shows the public listing and install action for `com.sidequestchess.app`, and an installed read-back reports code 350 from `com.android.vending`.

## 6. Rollout monitoring and rollback handle

No previous Production release exists, so there is no lower Production version to restore. Before submission, preserve code 350's AAB hash, EAS build, source SHA, Play release record, and current Internal-testing availability.

Halt criteria: any launch crash/ANR, broken sign-in or account deletion, material proof/quest failure, policy/declaration mismatch, wrong package/signing/version, private-data exposure, or severity-1/2 user harm. The authorized 100% rollout has no staged rollback window. Before public availability, cancel or halt the pending publication where Play permits and record the state. After public availability, use Play's available stop/unpublish controls only when warranted, preserve evidence, and prepare a corrective higher-version release. Code 350 remains the immutable Internal-testing recovery artifact, not a lower Production rollback target. Any corrective build must use version code 351 or higher, pass the complete release gates, and receive separate Production authorization; an Android version code cannot be rolled back by uploading a lower code.

After Google approval, verify public listing/installability, package/version/installer/signing, launch, sign-in, public browsing, one Solo proof path, Multiplayer browsing, support/privacy/terms, account deletion entry, and crash/ANR status. Continue distinguishing review approval from public availability.

## 7. Explicit approval gate

**Exact owner approval phrase:**

`APPROVE GOOGLE PLAY PUBLIC PRODUCTION LAUNCH OF UNCHANGED CODE 350`

That phrase authorizes only the exact transaction in this packet after all fail-closed checks pass. It does not authorize a new build/version, tester changes, legal-fact invention, account/secret/signing changes, spending, external communications, DNS/auth changes, or publication to any other store.
