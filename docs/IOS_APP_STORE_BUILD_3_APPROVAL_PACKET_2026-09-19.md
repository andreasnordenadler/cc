# Side Quest Chess — App Store approval packet: 0.1.349 (3)

**Prepared:** 2026-09-19; **reconciled:** 2026-09-22 01:52 CEST.
**Status:** **CURRENT APP STORE CONNECT READBACK — WAITING FOR REVIEW.** Read-only App Store Connect inventory showed Side Quest Chess (Apple ID `6804424166`), iOS version `0.1.349`, with the selected build shown in App Store Connect as **build 3**, reviewer sign-in fields populated, and **Manually release this version** selected (Manual release behavior). This packet authorizes no Apple mutation; do not upload, replace the build, edit metadata, answer App Review, remove the version from review, or release.

## Exact candidate identity

| Item | Verified value |
| --- | --- |
| Product | Side Quest Chess |
| Frozen candidate source commit | `82a5fc62b24e107143f84107a87da3f264516dee` |
| Frozen source branch at archive creation | `chore/ios-app-review-build-3-20260917` |
| Version / build | `0.1.349 (3)` |
| Bundle ID | `com.sidequestchess.app` |
| Device family | iPhone and iPad (`1,2`) |
| IPA | `/Users/sam/Projects/sam-operating-system/evidence/sqc-app-store-build3-20260919/export/SideQuestChess.ipa` |
| IPA SHA-256 | `8000e9f2edd067a2d7d206f292b5ea7695db3c19f53c8e190bcf618a9ba544f7` |
| IPA size | 58,700,458 bytes |
| Build-2 separation | Retained build 2 is **not** this candidate and must never be relabelled or submitted as build 3. |

Local IPA inspection verified `CFBundleDisplayName=Side Quest Chess`, `CFBundleShortVersionString=0.1.349`, `CFBundleVersion=3`, production bundle ID, `sidequestchess` and `com.sidequestchess.app` URL schemes, iOS 15.1 minimum, iPhone/iPad support, Apple Sign In entitlement, `get-task-allow=false`, and `ITSAppUsesNonExemptEncryption=false`. The retained Xcode archive itself carries the Apple Development signature (and `get-task-allow=true`) for Team ID `326A3FZB2Q`; the exported IPA carries the Apple Distribution signature (and `get-task-allow=false`) for that same Team ID. The archive is provenance evidence and the IPA is the sole submission candidate. Neither fact authorizes use, renewal, change, or upload of any signing identity.

## Candidate verification completed

- The frozen candidate source commit `82a5fc62b24e107143f84107a87da3f264516dee` matched `origin/main` when the archive/export was created. Reconciled `origin/main` is now `f2d28e6603268b42b38e939368fc504e70430f41`; this packet does not claim that later source is byte-identical to build 3. `app.json` in the frozen source declares version `0.1.349`, build `3`, bundle `com.sidequestchess.app`, iPhone+iPad support, Apple Sign In, and exempt-encryption declaration.
- The retained local archive/export receipt records `ARCHIVE SUCCEEDED` and `EXPORT SUCCEEDED` at 2026-09-19 14:19 UTC for this IPA. Separately, the retained `upload.log` reports “Upload succeeded” and “Uploaded package is processing” for `SideQuestChess`. The earlier `inspection.json` records `uploaded: false`; it is a stale pre-upload inspection artifact, not evidence that the later upload log is false. The 2026-09-22 read-only App Store Connect inventory reconciled the current selected build as `0.1.349 (3)` and version disposition as **Waiting for Review**. It did not change processing/compliance, metadata, review, or release state.
- Fresh targeted iOS/auth/release contracts: **67 passing**. They cover generated-project identity, Apple sign-in availability/completion/recovery, encryption declaration, EAS toolchain, release provenance, review packet, and release workflow controls.
- Fresh repository gates (2026-09-20): full suite **2,296 passing**; root lint and production web build passed; mobile TypeScript passed; Expo Doctor **17/18** with the known native-folder/app-config advisory. The advisory is expected while the disposable generated `apps/mobile/ios/` tree is present; no other Expo Doctor check failed. The frozen build-3 `apps/mobile` tree remains byte-identical to current `origin/main`; this does not imply that later web/analytics source is part of the signed IPA.
- Mobile TypeScript check: **passed**.
- Build-3 IPA inspection: **passed** for the identity and signing facts above.
- Owner-attended evidence: Apple Sign In, session persistence, Google Sign In, and reviewer-password login were successfully exercised. This is owner-attended integration evidence, not an App Store Connect or TestFlight receipt.
- iPad Simulator acceptance passed on iPad Air 11-inch (M4), iOS 27.0; evidence: `/Users/sam/Projects/sam-operating-system/nova/SQC_IPAD_SIMULATOR_ACCEPTANCE_2026-09-18.md`. Simulator evidence does not prove store delivery, signing, real-device behavior, screenshots, or production review acceptance.
- The owner explicitly waived physical-device testing for this cycle. It is not an approval blocker for this packet and is not claimed as completed evidence.

### Current evidence limits

- The authoritative documentation checkout has a disposable untracked generated `apps/mobile/ios/` tree. It is not release source. The fresh isolated frozen-candidate check also exposed the tracked-native-folder/app-config Expo Doctor advisory described above; no rebuild was performed.
- App Store Connect was read-only inspected at 2026-09-22 01:52 CEST. It confirmed the version is Waiting for Review, selected build 3, reviewer credentials present, and manual release. It did not establish an App Review outcome, full-resolution screenshot provenance, the iPad media count, or legal/privacy/rights answers. The current browser session later expired to the login page; no additional inventory can be obtained without owner interactive Apple sign-in/MFA.

## Reproducible archive/export and App Store reconciliation plan

The retained IPA is already the sole build-3 candidate. **Do not rebuild it through the current EAS `production` profile:** `autoIncrement: true` may create build 4. Before any separately approved external action:

1. Use a clean detached checkout at the frozen candidate commit `82a5fc62b24e107143f84107a87da3f264516dee`; verify `apps/mobile/app.json` declares `0.1.349 (3)` / `com.sidequestchess.app`. Do not substitute current `origin/main`, which has advanced since archive creation.
2. Verify only the retained IPA at the path above: SHA-256 `8000e9f2edd067a2d7d206f292b5ea7695db3c19f53c8e190bcf618a9ba544f7`, 58,700,458 bytes, bundle/version/build, device families `1,2`, Team ID `326A3FZB2Q`, Apple Sign In, `get-task-allow=false`, and exempt-encryption state.
3. Preserve and re-read the local archive/export provenance receipt that binds this IPA to the frozen source; the IPA itself does not contain the Git commit.
4. First obtain a read-only App Store Connect inventory. Reconcile the locally recorded upload for this exact version/build, its processing/compliance state, and immutable build ID against the IPA identity and local provenance receipt. Do not upload another copy, select, assign, submit, answer review, or release without further explicit approval.

## Exact current public listing copy (English U.S.)

Read-only App Store Connect inventory at 2026-09-22 01:52 CEST returned the following current text. This records state; it does not approve or request an edit.

| Field | Current value |
| --- | --- |
| Promotional text | Your next chess game needs a terrible side plot. |
| Keywords | `challenge,quests,board,strategy,goals,multiplayer,achievements,chess` |
| Support URL | https://sidequestchess.com/support |
| Marketing URL | https://sidequestchess.com |
| Version | `0.1.349` |
| Copyright | 2026 Crowdler AB |
| Release behavior | **Manually release this version** |

**Description (exact current copy)**

> Chess, with optional Side Quests.
>
> Your next chess game needs a terrible side plot.
>
> Pick one ridiculous quest, then play a normal public chess game. Side Quest Chess handles the paperwork and awards unnecessary heraldry if your bad idea survives inspection. No chess-site password. No special game mode. One public game and an unreasonable amount of heraldry.
>
> Browse solo Side Quests, read the rules, and choose a different reason to play your next game.
>
> Explore official weekly Multiplayer Side Quests, inspect their challenges and rules, and find a reason to play alongside other quest-seekers. Join a Multiplayer Side Quest before playing its proof game.
>
> Side Quest Chess is a companion to your online chess games. Choose a quest here, play your game outside the app, then return to check your result.
>
> Your pieces have a job to do. Give them a side quest.

## Screenshot inventory

App Store Connect shows four iPhone screenshots for the in-review version. The current CDN previews were read without changing media: `iphone-00-home-physical.png` (`5f6377572525b4924354165f9745d61e23306a2a5adf107636031a4dc27a8155`), `iphone-01-solo.png` (`484d42e55ffada4e5d7839fbc6d0b340b1a5b265191d72c7c64394e06df5607a`), `iphone-02-knights.png` (`54b362465398d1a725d4120d2564c7c82e1bdf0b37673f115066d5bd3a7c7c42`), and `iphone-03-multiplayer.png` (`26646b514856d666f9b3c408b7cd5fb3843e791b709646645a5e4ddb2907886c`). Each was a 368×800 CDN preview only; this does not prove full-resolution source provenance or signed-IPA runtime state. The read-only page inspection did not establish an iPad screenshot count.

Two retained local files are draft assets; neither is accepted or selected in App Store Connect. They are inventory evidence only, not approved submission graphics:

| Asset | Device / frame | Pixels | SHA-256 |
| --- | --- | --- | --- |
| `screenshots-draft/iphone17pro-home.png` | iPhone 17 Pro Home | 1206 × 2622 PNG | `376402aee2d1ae6228e999707aef838b13680153d3a4cf0b256b963d01be8534` |
| `screenshots-draft/ipadpro13-home.png` | iPad Pro 13 Home | 2064 × 2752 PNG | `fc4051cc374343c702d9a85cf3704bc3fb0d36e1a2508de3ddf9cdf0af13bb8e` |

Required before metadata entry/review:

1. iPhone: 1–10 truthful frames from build 3 at a currently accepted Apple capture size; proposed flow is Home/selection, quest detail/proof, multiplayer, community, Trophy Cabinet, account/support.
2. iPad: while tablet support remains enabled, equivalent truthful build-3 frames at a currently accepted 13-inch iPad size, including portrait/landscape where selected.
3. App icon: archive-extracted 1024×1024, no alpha, visually checked for correct full name.
4. Manifest each chosen image with candidate IPA hash, version/build, device, OS, orientation, locale, fixture, pixel dimensions, file format, and SHA-256.

Reject splash/login-only frames, personal data, debug overlays, stale names, fake achievements, clipped UI, and keyboard/modal residue. Reconfirm Apple’s accepted dimensions in the live App Store Connect UI at capture time.

## Privacy, rights, and content checklist — not declarations

**Draft only; do not adopt in App Store Connect without owner/legal confirmation and live readback.**

- Privacy: no tracking is the working draft. Reconcile Clerk, Apple/Google/Facebook sign-in, Expo/React Native SDKs, backend/hosting/security logs, public-game retrieval, support diagnostics, retention/deletion, and the exact IPA/native privacy manifests.
- Encryption: IPA and source declare exempt encryption, but the App Store Connect export-compliance answer remains an approval-gated legal declaration.
- UGC/safety: content filtering, central moderation workflow, response/removal operation, and sufficient abusive-user blocking are unresolved. Do not promise them in a review response.
- Age rating: working answers identify UGC/social/media/messaging surfaces; live questionnaire answers and regional results are not yet recorded. Made for Kids is provisional **No**.
- Content rights: obtain owner/legal evidence for Lichess/Chess.com public records, APIs, names, marks, territories, and app metadata/assets.
- Distribution/territories: Public vs Private Distribution, territory list, EU trader status, Mac/Apple Vision Pro availability, China mainland/Vietnam requirements, copyright, SKU, and support-phone requirement remain owner/legal/App Store Connect decisions.
- Android and web public launch-order gate: current policy requires both public launches to be verified before iOS App Review submission or public release; this packet does not waive that gate.

## Reviewer access and factual App Review response

- Reviewer-password login has been owner-tested successfully. Keep its actual non-expiring, non-personal review fixture and password only in App Store Connect’s protected review-access fields; never place credentials in source, this packet, or chat.
- Apple Sign In, persistent session, and Google Sign In have owner-attended success evidence. Do not claim physical-device, TestFlight, external-test, or App Review acceptance.
- A factual review note may state only after the live inventory and all unresolved safety/metadata facts are resolved:

> Side Quest Chess lets players choose solo or multiplayer chess challenges and check results against public games associated with a configured Lichess or Chess.com username. The app does not request or store chess-site passwords and is independent from those services. Sign-in is required for account-backed progress, proof checks, creation/joining, support messages, safety controls, and account deletion. Review access uses the non-personal credentials supplied in App Store Connect. Support: https://sidequestchess.com/support. Privacy: https://sidequestchess.com/privacy.

Do not add unverified claims about moderation, blocking, deletion completeness, SSO provider review access, TestFlight delivery, or physical-device behavior.

## Approval boundary and next owner decision

**Do not upload, replace, remove from review, reply, edit, resubmit, or release** build 3; do not mutate App Store Connect metadata, privacy, age, territories, pricing, review notes, users, roles, credentials, or release settings.

No submission action is currently required: App Store Connect already displays `0.1.349 (3)` as **Waiting for Review** with manual release selected. If Apple approves the version, the only next owner decision is whether to release it manually. Requested approval wording: **“I approve manual release of the confirmed Side Quest Chess 0.1.349 (3) build, IPA SHA-256 `8000e9f2…ba544f7`, as currently approved by App Review.”** If Apple requests information or rejects the build, Andreas must explicitly approve the exact reply, removal, or resubmission action instead.
