# Side Quest Chess — App Store approval packet: 0.1.349 (3)

**Prepared:** 2026-09-19
**Status:** **EXPORTED AND INSPECTED — NOT UPLOADED.** The local archive/export receipt verifies the exact IPA but is not an Apple upload, processing, TestFlight, or App Store Connect receipt. The available Safari session is logged out, so read-only App Store Connect inventory is not yet available. This packet authorizes no Apple mutation.

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
- The retained Xcode archive and export receipt record `ARCHIVE SUCCEEDED` and `EXPORT SUCCEEDED` at 2026-09-19 14:19 UTC. They explicitly record **EXPORTED AND INSPECTED — NOT UPLOADED**. The build’s Apple processing, compliance, rejection, selection, metadata, TestFlight, and release states are **not independently confirmed in App Store Connect**. No upload, selection, metadata update, submission, or release is authorized.
- Fresh targeted iOS/auth/release contracts: **30 passing**. They cover generated-project identity, Apple sign-in availability/completion/recovery, encryption declaration, EAS toolchain, release provenance, review packet, and release workflow controls.
- Fresh frozen-candidate gates (2026-09-19): full suite **2,271 passing**; root lint and production web build passed; mobile TypeScript and Expo Doctor (**18/18**) passed. The isolated candidate checkout was clean before and after these gates.
- Mobile TypeScript check: **passed**.
- Build-3 IPA inspection: **passed** for the identity and signing facts above.
- Owner-attended evidence: Apple Sign In, session persistence, Google Sign In, and reviewer-password login were successfully exercised. This is owner-attended integration evidence, not an App Store Connect or TestFlight receipt.
- iPad Simulator acceptance passed on iPad Air 11-inch (M4), iOS 27.0; evidence: `/Users/sam/Projects/sam-operating-system/nova/SQC_IPAD_SIMULATOR_ACCEPTANCE_2026-09-18.md`. Simulator evidence does not prove store delivery, signing, real-device behavior, screenshots, or production review acceptance.
- The owner explicitly waived physical-device testing for this cycle. It is not an approval blocker for this packet and is not claimed as completed evidence.

### Current local limitations

- The authoritative documentation checkout has a disposable untracked generated `apps/mobile/ios/` tree. It is not release source. The isolated frozen candidate regenerated and then removed its own iOS tree; Expo Doctor passed 18/18 there.
- App Store Connect read-only inspection is blocked by the logged-out Safari session: `https://appstoreconnect.apple.com/login?targetUrl=%2Fapps&authResult=FAILED`.

## Reproducible archive/export and upload plan

The retained IPA is already the sole build-3 candidate. **Do not rebuild it through the current EAS `production` profile:** `autoIncrement: true` may create build 4. Before any separately approved external action:

1. Use a clean detached checkout at the frozen candidate commit `82a5fc62b24e107143f84107a87da3f264516dee`; verify `apps/mobile/app.json` declares `0.1.349 (3)` / `com.sidequestchess.app`. Do not substitute current `origin/main`, which has advanced since archive creation.
2. Verify only the retained IPA at the path above: SHA-256 `8000e9f2edd067a2d7d206f292b5ea7695db3c19f53c8e190bcf618a9ba544f7`, 58,700,458 bytes, bundle/version/build, device families `1,2`, Team ID `326A3FZB2Q`, Apple Sign In, `get-task-allow=false`, and exempt-encryption state.
3. Preserve and re-read the local archive/export provenance receipt that binds this IPA to the frozen source; the IPA itself does not contain the Git commit.
4. First obtain a read-only App Store Connect inventory. Because build 3 is **not uploaded**, any upload requires Andreas’s separate scoped authorization naming this IPA SHA-256. After any authorized upload, read back Apple processing/compliance state and immutable build ID. Do not select, assign, submit, answer review, or release without further explicit approval.

## Exact public listing copy (English U.S.)

| Field | Candidate copy/value |
| --- | --- |
| Name | Side Quest Chess |
| Subtitle | Turn chess games into quests |
| Primary category | Games — Board; Strategy |
| Secondary category | None |
| Price | Free |
| Copyright | 2026 Crowdler AB |
| Privacy Policy URL | https://sidequestchess.com/privacy |
| Support URL | https://sidequestchess.com/support |
| Marketing URL | https://sidequestchess.com |
| Promotional text | Pick a Side Quest, play your public chess games, and come back for a checked result. |
| Keywords | `challenge,quests,board,strategy,goals,multiplayer,achievements` |
| Release behavior | **Manual release** — select only with Andreas's explicit approval after App Review approval. |

**Description (exact candidate copy)**

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

## Screenshot inventory

No App Store screenshot set is accepted or selected in App Store Connect.

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

## Approval boundary and immediate owner action

**Do not upload, select, submit, or release** build 3; do not mutate App Store Connect metadata, privacy, age, territories, pricing, review notes, users, roles, credentials, or release settings.

The only immediate blocking action is interactive Apple sign-in/MFA by the authorized owner on the already-open Safari login page. Once authenticated, the permitted next action is read-only inventory of the app record, build 3 processing/rejection/compliance status and immutable build ID, bundle/SKU duplicates, listing metadata, privacy, age rating, reviewer access, screenshots, territories, and release setting. Reconcile that receipt into this packet before requesting a scoped explicit approval.

Requested future approval wording, only after the read-only inventory is reconciled: **“I approve selection/submission of the confirmed Side Quest Chess 0.1.349 (3) build, IPA SHA-256 `8000e9f2…ba544f7`, with the exact listing copy, graphics, review response, privacy/rights answers, territories, and Manual release setting presented in the final packet.”**
