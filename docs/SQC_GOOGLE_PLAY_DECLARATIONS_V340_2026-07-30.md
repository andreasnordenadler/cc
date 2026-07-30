# Side Quest Chess — Google Play declarations pack (v340)

Prepared: 2026-07-30

Candidate: `0.1.340 (341)` on Internal testing

Package: `com.sidequestchess.app`

Publisher: Crowdler AB

Scope: evidence-bound answers for Google Play's App content forms. This is a launch draft, not legal advice, legal adoption, or authorization to edit Play Console. Answers marked **READY** come from confirmed product facts or executable candidate behavior. Answers marked **BLOCKED** must not be guessed or submitted until the named fact is resolved.

## Candidate and evidence boundary

- Frozen AAB SHA-256: `26e7cfdd493308947876b5373f95a7d576e656e764027ad3ac41fd244f4b0483`.
- Reviewed source: `8eb128d81e6c05c0641ef3eb8f59704b12c38275`; merged by PR #92 and an ancestor of `origin/main` at preparation time (`37aad7f7b0e61ceee878faf203a9cbc23a33da02`).
- AAB inspection records package `com.sidequestchess.app`, version code 341, target SDK 36, `debuggable=false`, `allowBackup=false`, and production API `https://sidequestchess.com`.
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

Reporting is available for Community Solo and Community Multiplayer content through signed-in support/report flows. `sam@crowdler.com` is the owner-provided moderation contact. Do not answer that UGC is absent merely because the product has no open chat. No user-blocking control, adopted acceptable-use terms, or evidenced moderation response procedure was found; public UGC launch compliance remains **BLOCKED** until the policy requirement is checked against the shipped interaction model and the missing controls/process are resolved.

## Data safety — top-level answers

| Question | Exact answer / status |
|---|---|
| Does the app collect or share any required user-data types? | **Yes — READY.** Account, profile, user-generated content, support, public chess identity/game, progress, and app-interaction data leave the device. |
| Is all user data encrypted in transit? | **BLOCKED.** First-party, Clerk, OAuth, and public-provider URLs are expected to use TLS, but repository/AAB inspection alone does not prove every production auth, hosting, logging, Google, Facebook, Lichess, and Chess.com transfer. Verify with the exact Play-delivered candidate and provider configuration before answering Yes. |
| Can users request deletion? | **Yes — READY for in-app behavior.** My Account permanently deletes the SQC account, Clerk identity, account-attached profile/progress, and replicated Multiplayer references, failing closed if cleanup cannot complete. |
| External account-deletion URL | **BLOCKED.** The reachable privacy/support pages still contain an older contact and launch-draft controller/age text. Publish an adopted, signed-out deletion-request route or corrected policy/contact page before entering this URL for public submission. |
| Is collected data optional? | Mixed. Account/sign-in data is required only for account features; public browsing is available without an account. Chess usernames, UGC, support messages, and publication/sharing actions are user-provided or feature-initiated. First-party interaction events are automatic when instrumented actions occur. |

### Data types to disclose as collected

Use the form's current labels; preserve the following substance if labels change.

| Google data category | Candidate data | Purpose | Optional / required | Sharing status |
|---|---|---|---|---|
| Personal info — name | Clerk/profile name, username, SQC display name | Account management; app functionality | Required only when supplied/required by the chosen sign-in/profile flow | **BLOCKED vendor-role classification** |
| Personal info — email address | Clerk primary email; account-attached support context | Account management; authentication; support | Required for the supported email sign-up flow | **BLOCKED vendor-role classification** |
| Personal info — user IDs | Clerk/SQC account ID; public chess usernames/provider | Account management; app functionality; proof verification | Account ID automatic for signed-in users; chess username user-provided | **BLOCKED vendor/user-initiated classification** |
| Personal info — other info | Profile image URL/image display, brag line/bio, chess ratings snapshot | App functionality; personalization | User/provider supplied | **BLOCKED vendor-role classification** |
| Messages — other in-app messages | Support and abuse-report text plus diagnostics that the mobile client automatically appends on every submission: app/package/build, OS, API base, display name, connected chess usernames, active Solo title, Multiplayer counts, and timestamp | App functionality; support; fraud/abuse prevention | Message submission is user-initiated; the diagnostics attachment is automatic once submitted | **BLOCKED vendor-role classification** |
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

The AAB manifest nevertheless contains `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`, `USE_BIOMETRIC`, `USE_FINGERPRINT`, `VIBRATE`, network permissions, and the Play install-referrer binding permission. The app config requests no Android permissions, and reviewed product flows do not use storage upload, overlay, biometric, or advertising/referrer features. Treat this as a **release-hardening follow-up**: explain each merged permission from generated dependencies, remove unnecessary permissions in the next candidate where safe, and re-inspect downloaded AAB bytes. Manifest presence alone is not permission to answer a data-safety question inaccurately.

### Third-party sharing — BLOCKED before final submission

Do not currently submit a blanket **No data shared with third parties** answer. The candidate transfers data through or to:

- Clerk for authentication/account storage;
- Google and Facebook when the user selects those OAuth sign-in options through Clerk;
- hosting, delivery, security, and request-log infrastructure;
- Lichess and Chess.com public interfaces when a user requests a proof/profile/game lookup.

Google's form treatment can differ for processors/service providers and user-initiated transfers. The repository does not establish the complete production vendor list, contractual roles, retention, or whether every transfer meets a form exception. Obtain the deployed vendor/subprocessor inventory and role determination, then mark each row consistently. Determine whether a Clerk-hosted profile image requires the current **Photos and videos** label rather than only Personal info — other. Until then, the sharing column above is intentionally fail-closed.

## Persistent public-proof and support-diagnostic disclosures — BLOCKED

Public proof links contain a readable signed payload that can include runner/display name, provider/game ID, timestamps, board position, and move evidence. A link already shared can remain readable independently of the Clerk account; current account deletion does not provide proof-link revocation. The final policy and deletion disclosure must say so accurately, define any future revocation/deletion path, and distinguish deleted account-attached data from already published proof artifacts and provider-public game records.

The mobile support/report flow automatically appends the diagnostics listed in the Data safety table to every submitted message. Current UI/privacy wording suggests diagnostics are included only when the user separately chooses to copy or provide them. Before public submission, either change the behavior to explicit opt-in or update the pre-submit UI and adopted policy so the automatic attachment is conspicuous and accurate.

## Government, financial, health, and news declarations — READY

- Government app: **No**.
- Financial-features declaration: **No financial features**.
- Health-app declaration: **Not a health app; no health features**.
- News/magazine declaration: **No**.
- Ads declaration: **No ads**.

If Play introduces or displays another specialized declaration, answer only from the frozen candidate behavior; do not infer a legal or regulated status from this document.

## Privacy-policy and legal adoption blockers

The current `/privacy` and `/terms` pages are implementation-based launch drafts. They conflict with owner-provided launch facts by naming `andreas.nordenadler@gmail.com` rather than `sam@crowdler.com`; the privacy page also says controller identity and minimum age are unconfirmed. It does not establish the complete production vendor list, processor/controller roles, primary processing countries/international transfers, backup/log retention, legal retention exceptions, statutory request process/timeline, persistent public-proof handling, automatic support diagnostics, or final effective date.

Before public store submission, an authorized owner/legal reviewer must approve and publish a consistent contract covering at least:

1. Crowdler AB's legal controller identity and address.
2. Minimum age 13 and the chosen parental-consent posture.
3. Processing countries, transfer mechanism, and complete vendor/subprocessor roles.
4. Sale/sharing position and the Data safety sharing classification.
5. Deletion request URL/process, response timing, backup/log retention, and legal exceptions.
6. `sam@crowdler.com` as the public support/privacy/moderation contact.
7. Notice process and effective date.
8. UGC rules and moderation operations: adopted acceptable-use terms, objectionable-content handling, report response ownership, and whether Play policy requires a user-blocking control for the shipped interaction model.

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
- frozen AAB provenance: `apps/mobile/artifacts/android/mobile-v340/evidence/AAB_PROVENANCE.md` in the responsive-release evidence lane
- exact listing pack: `docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md`

Google's current help pages could not be re-fetched in this cycle because the managed web backend returned a billing/authorization error. Therefore this pack deliberately avoids claiming that remembered form labels are immutable. Reconcile labels in the live Play Console at the authorized entry gate while preserving the evidence-bound substance above.
