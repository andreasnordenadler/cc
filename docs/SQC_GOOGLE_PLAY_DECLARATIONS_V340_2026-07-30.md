# Side Quest Chess — Google Play declarations pack (current-source draft)

Prepared: 2026-08-02

Current checked-in release baseline: `0.1.344 (344)`; current inspected Google Play upload candidate: `0.1.344 (345)`

Package: `com.sidequestchess.app`

Publisher: Crowdler AB

Scope: evidence-bound answers for Google Play's App content forms. This is a launch draft, not legal advice, legal adoption, or authorization to edit Play Console. Answers marked **READY** come from confirmed product facts or executable candidate behavior. Answers marked **BLOCKED** must not be guessed or submitted until the named fact is resolved.

## Candidate and evidence boundary

- Current canonical source: `origin/main` at `cbee7b1d53111b4c9b55a957ec43c3e2d86655fc`; its latest mobile baseline is merged PR #168 at `0364be9e2f19a81de69716dbff04c0361a2b37a4` (`0.1.344`, checked-in code `344`). That same immutable commit is the EAS build source. Every later `origin/main` change is web-only; native app, tracked Android, Expo/EAS production configuration, dependency, release-script, and mobile-workflow inputs remain byte-identical to the build source.
- The current inspected AAB is `0.1.344 (345)`, SHA-256 `b4847e7b42817f1cc3109f37c1296465018edbce6aa65c390ab073ab21f8dc3d`, size 86,157,026 bytes, built by EAS build `4cfb5ba3-8795-4804-b111-a742a9fee483` from `0364be9e2f19a81de69716dbff04c0361a2b37a4`. It is the only current upload candidate; codes 342 through 344 are superseded.
- Current AAB inspection confirms package `com.sidequestchess.app`, version `0.1.344` (345), min SDK 24, target/compile SDK 36, no enabled debuggable attribute, `allowBackup=false`, four ABIs, ZIP and bundletool validity, production API `https://sidequestchess.com`, bounded runtime permissions, and continuity with the established upload certificate. The Play app-signing certificate remains a separate console/read-back and Play-delivered-install gate.
- Preserved Play Console evidence records `0.1.340 (341)` as available on Internal testing with no tester list selected. This is historical track state, not the current upload candidate and not production publication.
- The candidate uses Clerk authentication and the first-party SQC API. It reads public Lichess and Chess.com records for user-selected usernames/game references.
- The candidate has no advertising, billing, subscription, or real-money-prize integration.
- The candidate supports public/community content, Multiplayer participation, proof links, support/report messages, and permanent in-app account deletion.

## Store setup and monetization — confirmed product facts

| Play field | Exact answer |
|---|---|
| App or game | **Game** |
| Category | **Board** |
| Pricing | **Free** |
| Contains ads | **No** |
| In-app products | **No** |
| Subscriptions | **No** |
| Real-money gambling, contests, or prizes | **No** |
| Developer / publisher | **Crowdler AB** |
| Support, privacy, and moderation email | `sam@crowdler.com` |
| Website | `https://sidequestchess.com` |
| Privacy-policy URL | `https://sidequestchess.com/privacy` — URL is reachable, but public-policy adoption remains **BLOCKED** below |
| Distribution | **Worldwide** |

## Target audience and children — confirmed product direction; legal adoption BLOCKED

The owner-provided launch facts set Side Quest Chess at **13 and older** and not directed to children under 13. The implemented privacy draft has not yet adopted that fact and still says the age/parental-consent posture is unresolved. The selection below is therefore paste-ready only after the policy/legal adoption gate is closed.

If the current Play form presents age-band checkboxes, select:

- **13–15**
- **16–17**
- **18 and over**

Do not select 5 and under, 6–8, or 9–12. Do not represent the app as designed for children or participate in Families solely because teenagers are included. The store listing must keep the plain `13+` statement.

This is a product target-audience answer, not a substitute for the separate regional content-rating questionnaire or legal confirmation of any parental-consent terms.

## App access — behavior confirmed; reviewer-account acceptance BLOCKED

Exact declaration:

- **Some functionality is restricted by sign-in.**
- Public Solo and Multiplayer catalogs can be browsed signed out.
- Account/profile continuity, connected chess usernames, quest selection/progress, proof checks, trophies, creation, participation, reporting, support threads, and deletion require a Side Quest Chess account.
- Reviewer instructions should state that no Lichess or Chess.com password is needed; only public chess usernames and public games are used.

Because core review paths require sign-in, provide and verify one working disposable, non-sensitive SQC reviewer account and exact access instructions in Play Console. This is a submission blocker, not an optional convenience. Never put its password, session, recovery material, or private invite codes in Git, a PR, screenshots, or this pack. Use a disposable public chess identity with no private profile data.

## Content rating — exact factual posture

Use these facts when completing the interactive IARC questionnaire; do not claim a final rating before Play calculates it:

| Topic | Factual answer |
|---|---|
| Violence / graphic content | No product-authored violence or graphic content; ordinary abstract chess play only |
| Sexual content / nudity | No |
| Profanity / crude humor | No product-authored profanity; user-created quest names/descriptions may contain text until reported/moderated |
| Controlled substances | No |
| Fear / horror | No |
| Gambling simulation | No |
| Real-money gambling or prizes | No |
| Purchases | No |
| Advertising | No |
| User-generated content | **Yes** — Custom/Community and Multiplayer Side Quest names, descriptions, rules, profile/display material, participation, and proof/support/report context |
| Users communicate or exchange content | **Yes, bounded** — users publish/join shared quest content and participation; this is not an unrestricted live chat product |
| Location sharing | No |

Content-report entry points are available for non-owner Community Solo and Community Multiplayer content on Android and the website. Android and signed-in web Community Multiplayer reporting bind the exact target ID outside the editable reason and submit structured target data through the authenticated report API. Community Solo uses the account support flow; signed-out web handoffs do not submit a report, but require sign-in and then prefill editable context into the support composer. Merged PR #166 records the client-asserted source label as `mobile` when a request sends `x-side-quest-chess-client: android` and otherwise records `website`; executable route tests cover both branches. That header is requester-controlled, so the label is useful for diagnostics but is not trustworthy proof of Android-versus-website origin. The reviewed source still does not provide a distinct reported-user identity, user blocking, or an operable moderation queue. `sam@crowdler.com` is the owner-provided intended moderation contact, but the public privacy and terms pages still expose `andreas.nordenadler@gmail.com`. Do not answer that UGC is absent merely because the product has no open chat.

### UGC controls and moderation operations — implementation confirmed; adoption BLOCKED

Confirmed shipped controls:

- public user-created Solo and Multiplayer Side Quests have content-report entry points on their detail surfaces;
- only signed-in users can submit a report, and the server binds it to the authenticated SQC account;
- Android and signed-in web Community Multiplayer reports bind an exact target ID separately from the bounded editable reason; Community Solo submissions remain account-attached support messages, while signed-out web handoffs require sign-in before prefilling that support flow;
- every reporter receives an in-product submission result; support-thread reports remain readable by the reporter and the thread UI can display an admin-authored entry, but no current admin reply-authoring workflow was found;
- the product deliberately has no unrestricted live chat, direct messaging, photo/video upload, or location-sharing surface.

Confirmed operational gaps:

- there is no user-blocking control;
- there is no distinct in-app user-reporting control;
- structured reports persist a tested client-asserted source label, but the requester-controlled header cannot support a trustworthy origin-specific audit;
- there is no dedicated moderation queue, role-gated removal tool, escalation log, or executable takedown workflow in the reviewed source;
- no adopted prohibited-content rules, response target, emergency escalation path, repeat-abuse policy, appeal path, or retention rule for moderation records was found;
- storing a report in the reporter's private thread is not evidence that `sam@crowdler.com` is notified or that the report will be reviewed within a defined time.

Recommended owner/legal adoption decision before broad public UGC launch:

1. Treat Play's current UGC policy as a definite submission blocker for the present public UGC model: implement and test distinct in-app reporting for users and content plus user blocking before submission.
2. Adopt the prohibited-content categories and identify who may hide/remove a quest or restrict an account.
3. Set an explicit review target and urgent-harm escalation route that the named moderation owner can actually operate.
4. Choose an auditable queue/notification mechanism; the existing private support-thread write alone is insufficient as an operations queue.
5. Define reporter acknowledgement, creator notice, appeal/reinstatement, repeat-abuse handling, and moderation-record retention.
6. Verify the complete report → owner review → action → reporter outcome path with disposable accounts before marking the UGC declaration READY.

Until those decisions and controls are adopted and exercised, public UGC launch compliance remains **BLOCKED**. This draft does not invent an SLA or claim a removal capability that the product does not yet have.

## Data safety — top-level answers

| Question | Exact answer / status |
|---|---|
| Does the app collect or share any required user-data types? | **Yes — READY.** Account, profile, user-generated content, support, public chess identity/game, progress, and app-interaction data leave the device. |
| Is all user data encrypted in transit? | **BLOCKED.** First-party, Clerk, OAuth, and public-provider URLs are expected to use TLS, but repository/AAB inspection alone does not prove every production auth, hosting, logging, Google, Facebook, Lichess, and Chess.com transfer. Verify with the exact Play-delivered candidate and provider configuration before answering Yes. |
| Can users request deletion? | **Yes — READY for in-app behavior.** My Account permanently deletes the SQC account, Clerk identity, account-attached profile/progress, and replicated Multiplayer references, failing closed if cleanup cannot complete. |
| External account-deletion URL | **BLOCKED.** The reachable privacy/support pages still contain the older `andreas.nordenadler@gmail.com` contact and launch-draft controller/age text, and they do not provide an adopted signed-out deletion-request workflow. Publish an adopted, signed-out deletion-request route or corrected policy/contact page before entering this URL for public submission. |
| Is collected data optional? | Mixed. Account/sign-in data is required only for account features; public browsing is available without an account. Chess usernames, UGC, support messages, and publication/sharing actions are user-provided or feature-initiated. First-party interaction events are automatic when instrumented actions occur. |

### Data types to disclose as collected

Use the form's current labels; preserve the following substance if labels change.

| Google data category | Candidate data | Purpose | Optional / required | Sharing status |
|---|---|---|---|---|
| Personal info — name | Clerk/profile name, username, SQC display name | Account management; app functionality | Required only when supplied/required by the chosen sign-in/profile flow | **BLOCKED vendor-role classification** |
| Personal info — email address | Clerk primary email; account-attached support context | Account management; authentication; support | Required for the supported email sign-up flow | **BLOCKED vendor-role classification** |
| Personal info — user IDs | Clerk/SQC account ID; public chess usernames/provider | Account management; app functionality; proof verification | Account ID automatic for signed-in users; chess username user-provided | **BLOCKED vendor/user-initiated classification** |
| Personal info — other info | Profile image URL/image display, brag line/bio, chess ratings snapshot | App functionality; personalization | User/provider supplied | **BLOCKED vendor-role classification** |
| Messages — other in-app messages | Support and abuse-report text; when the user explicitly opts in, bounded diagnostics including app/package/build, OS, API base, display name, connected chess usernames, active Solo title, Multiplayer counts, and timestamp | App functionality; support; fraud/abuse prevention | Message submission and diagnostics inclusion are user-initiated | **BLOCKED vendor-role classification** |
| App activity — app interactions | Page/action events, quest starts/outcomes, paths, quest/game IDs, source, coarse device category, timestamps | Analytics; app functionality; reliability | Automatic for instrumented use | **BLOCKED hosting/log classification** |
| Other user-generated content | Custom/Community/Multiplayer names, descriptions, rules, participation, standings, likes, public proof details | App functionality; social/community features | User-initiated | Public visibility is feature-directed; third-party classification still requires review |

Also record game/proof state, game IDs, timestamps, progress, trophies, invitations, and participation under the closest current Play labels (normally App activity and/or Other user-generated content). Do not omit them because the source chess records are public.

### Data types not evidenced by the reviewed candidate

Do **not** declare collection solely because an Android permission or transitive library exists. Source/runtime evidence does not show collection of:

- precise or approximate location;
- contacts;
- calendar;
- health or fitness information;
- financial, payment, purchase-history, or credit information;
- microphone/audio recordings;
- camera captures;
- SMS or call logs;
- local documents/files as user data;
- advertising IDs for advertising or behavioral profiling.

The current code-345 AAB was inspected after the permission-hardening merge. Its manifest is limited to Internet, network state, vibration, and the app-scoped dynamic-receiver permission; storage, overlay, biometric, fingerprint, location, camera, microphone, contacts, SMS, phone, and Play install-referrer permissions are absent. Manifest presence or absence alone is not permission to answer a data-safety question inaccurately.

### Third-party sharing — BLOCKED before final submission

Do not currently submit a blanket **No data shared with third parties** answer. The candidate transfers data through or to:

- Clerk for authentication/account storage;
- Google and Facebook when the user selects those OAuth sign-in options through Clerk;
- hosting, delivery, security, and request-log infrastructure;
- Lichess and Chess.com public interfaces when a user requests a proof/profile/game lookup.

Google's form treatment can differ for processors/service providers and user-initiated transfers. The repository does not establish the complete production vendor list, contractual roles, retention, or whether every transfer meets a form exception. Obtain the deployed vendor/subprocessor inventory and role determination, then mark each row consistently. Determine whether a Clerk-hosted profile image requires the current **Photos and videos** label rather than only Personal info — other. Until then, the sharing column above is intentionally fail-closed.

## Persistent public-proof disclosure — BLOCKED

Public proof links contain a readable signed payload that can include runner/display name, provider/game ID, timestamps, board position, and move evidence. A link already shared can remain readable independently of the Clerk account; current account deletion does not provide proof-link revocation. Draft PR #117 (`fix/account-deletion-proof-disclosure`, `18f580500ac67f6025714d9ca36e8d4791e93873`) corrects Android, web, and privacy deletion copy to disclose that boundary, but it remains a conflicting draft and has not been adopted or merged. Rebase and review that change against current `main`, then make the final policy and deletion disclosure consistent before submission.

PR #112 changed mobile support/report diagnostics from automatic attachment to explicit user consent. The code-345 AAB is bound to source containing that merged behavior; any console declaration must continue to describe diagnostics as opt-in. PR #166 subsequently added the client-asserted Android-versus-website source label, and the code-345 AAB includes that merged behavior; it did not make origin attribution tamper-resistant.

## Government, financial, health, and news declarations — READY

- Government app: **No**.
- Financial-features declaration: **No financial features**.
- Health-app declaration: **Not a health app; no health features**.
- News/magazine declaration: **No**.
- Ads declaration: **No ads**.

If Play introduces or displays another specialized declaration, answer only from the frozen candidate behavior; do not infer a legal or regulated status from this document.

## Privacy-policy and legal adoption blockers

The current `/privacy` and `/terms` pages are implementation-based launch drafts. They still publish `andreas.nordenadler@gmail.com` rather than the owner-provided `sam@crowdler.com`, and the privacy page says controller identity and minimum age are unconfirmed. They do not establish the complete production vendor list, processor/controller roles, primary processing countries/international transfers, backup/log retention, legal retention exceptions, statutory request process/timeline, adopted persistent-public-proof handling, or final effective date.

Before public store submission, an authorized owner/legal reviewer must approve and publish a consistent contract covering at least:

1. Crowdler AB's legal controller identity and address.
2. Minimum age 13 and the chosen parental-consent posture.
3. Processing countries, transfer mechanism, and complete vendor/subprocessor roles.
4. Sale/sharing position and the Data safety sharing classification.
5. Deletion request URL/process, response timing, backup/log retention, and legal exceptions.
6. `sam@crowdler.com` as the public support/privacy/moderation contact.
7. Notice process and effective date.
8. UGC rules and moderation operations: adopted acceptable-use terms, objectionable-content handling, an operable queue/removal/escalation process, report response ownership, and implementation of Play-required in-app user/content reporting and user blocking.

Green tests or a reachable policy URL do not adopt legal text.

## Console-entry order and explicit gate

1. Owner/legal resolves the blocked facts and adopts matching privacy/terms text.
2. Reconcile this pack against the exact Play Console question wording and current AAB.
3. Enter READY answers; complete IARC interactively from the factual posture above.
4. Enter reviewer credentials only in Play Console.
5. Save and read back every declaration without publishing.
6. Run Play pre-launch and Data safety checks; reconcile any SDK/permission findings.
7. Publication, track promotion, tester assignment, declarations submission, and external communication remain explicit owner gates.

## Evidence references

- `apps/mobile/app.json`
- `apps/mobile/package.json`
- `apps/mobile/App.tsx`
- `apps/mobile/src/api/sqc.ts`
- `src/app/api/mobile/account/route.ts`
- `src/app/api/mobile/support/route.ts`
- `src/app/api/analytics/route.ts`
- `src/lib/analytics.ts`
- `src/lib/account-deletion-cleanup.ts`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- current code-345 AAB provenance: `apps/mobile/artifacts/android/mobile-v344-code345/evidence/AAB_PROVENANCE.md` in the mobile release lane
- current internal tester and Play-delivered acceptance plan: `apps/mobile/artifacts/android/mobile-v344-code345/evidence/INTERNAL_TESTER_ACCOUNT_PLAN.md` in the mobile release lane
- responsive Android matrix: `apps/mobile/artifacts/android/mobile-v340/evidence/RESPONSIVE_LAYOUT_MATRIX.md` in the responsive-release evidence lane
- draft deletion-disclosure correction: PR #117 (`fix/account-deletion-proof-disclosure`)
- exact listing pack: `docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md`
- Google Play Developer Program Policy, User Generated Content: `https://support.google.com/googleplay/android-developer/answer/9876937?hl=en`

Google's current help pages could not be re-fetched in this cycle because the managed web backend returned a billing/authorization error. Therefore this pack deliberately avoids claiming that remembered form labels are immutable. Reconcile labels in the live Play Console at the authorized entry gate while preserving the evidence-bound substance above.
