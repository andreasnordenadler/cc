
## [LRN-20260504-001] correction

**Logged**: 2026-05-04T19:24:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
SQC back-link label should use title case: `Back to Quest Hub` with B/Q/H capitalized.

### Details
Andreas corrected the challenge detail back button from `Back to quest hub` to `Back to Quest Hub`.

### Suggested Action
Preserve title-case treatment for this navigation label in future SQC polish work.

### Metadata
- Source: user_feedback
- Related Files: src/app/challenges/[id]/page.tsx
- Tags: sqc, copy, casing

---

## [LRN-20260504-002] correction

**Logged**: 2026-05-04T19:42:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
For SQC active quest detail actions, `Restart` is ambiguous/risky; prefer `Deactivate` with confirmation, and use `Share this Quest` instead of `Send to friend`.

### Details
Andreas flagged the active quest hero action row as needing clearer intent. Deactivation should be explicit and confirmed before clearing the active quest.

### Suggested Action
Use clearer verb-first product copy and add confirmation dialogs for actions that clear/switch active quest state.

### Metadata
- Source: user_feedback
- Related Files: src/app/challenges/[id]/page.tsx, src/components/deactivate-quest-control.tsx
- Tags: sqc, ux-copy, confirmation

---

## [LRN-20260506-001] correction

**Logged**: 2026-05-06T11:22:00+02:00
**Priority**: medium
**Status**: applied
**Area**: assets

### Summary
When removing generated badge backgrounds, preserve dark crest ornamentation; remove only edge-connected background color.

### Details
Andreas corrected the Proof Loop Test badge transparency pass: the first background removal removed parts of the coat of arms, not just the navy square backing. The corrected approach restored the original asset and used a conservative flood-fill from image edges based on the navy background color, preserving dark green/blue ornamental details inside the crest.

### Suggested Action
For badge background removal, always preview against a high-contrast matte and verify the full crest silhouette before deploy. Avoid aggressive dark-pixel thresholds that can cut interior ornaments.

### Metadata
- Source: user_feedback
- Related Files: public/badges/v6/proof-loop-test-badge.png
- Tags: image-processing, transparency, sqc-badges

---

## [LRN-20260506-001] correction

**Logged**: 2026-05-06T23:21:00+02:00
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
For SQC completed proof sharing, users want one simple social Share button, not utility links/buttons.

### Details
Andreas corrected the proof share UI after public proof links were added: the completed proof section should not expose separate copy/proof-page/proof-image/proof-log controls. The Share action should share the scroll image when possible and link to the home page.

### Suggested Action
For celebratory/share surfaces, default to one high-level social share action and keep technical proof URLs/internal logs out of the primary UI unless explicitly requested.

### Metadata
- Source: user_feedback
- Related Files: src/components/share-proof-actions.tsx, src/app/challenges/[id]/page.tsx
- Tags: sqc, sharing, ux-simplification

---

## [LRN-20260507-002] SQC local time fix must cover receipt/status surfaces, not only proof surfaces

**Logged**: 2026-05-07T11:42:00+02:00
**Category**: correction
**Priority**: high

### Summary
Andreas reported that after the first timezone fix, the quest refresh/check status still displayed 09:38 while his local time was 11:38.

### Lesson
When fixing timezone display, audit every surface that formats the same timestamp class. For SQC this includes proof pages/images, challenge detail receipt facts, provider status cards, result latest-check cards, and account completed quest rows.

### Metadata
- Source: user_correction
- Related Files: src/app/challenges/[id]/page.tsx, src/app/result/page.tsx, src/app/account/page.tsx
- Tags: sqc, timezone, receipt-status, correction

---

## [LRN-20260507-003] SQC “full image share” must make the visible scroll an image too

**Logged**: 2026-05-07T11:50:00+02:00
**Category**: correction
**Priority**: high

### Summary
Andreas reported that after completing a quest, the visible victory scroll was still not 100% image.

### Lesson
If product feedback says a proof/scroll should be “an image,” do not only attach an image to the share payload. The user-visible completion surface and public proof page must render the generated image directly, otherwise the feature still feels like HTML pretending to be an image.

### Metadata
- Source: user_correction
- Related Files: src/app/result/page.tsx, src/app/proof/[token]/page.tsx, src/app/challenges/[id]/page.tsx, src/components/proof-image.tsx
- Tags: sqc, proof-image, victory-scroll, correction

---

## [LRN-20260507-004] SQC trophy text centering needs child-level overrides

**Logged**: 2026-05-07T13:13:00+02:00
**Category**: correction
**Priority**: medium

### Summary
Andreas reported that the trophy-card subtitle under the quest name still was not centered after an earlier centering pass.

### Lesson
When a component is built on top of a generic list-item style, centering only the wrapper can be insufficient. Explicitly override inherited `span/strong` layout, width, overflow, and text alignment on the nested children too.

### Metadata
- Source: user_correction
- Related Files: src/app/globals.css
- Tags: sqc, css, alignment, trophy-card

---

## [LRN-20260507-005] Completed active quests must visually prefer completed state

**Logged**: 2026-05-07T15:15:00+02:00
**Category**: correction
**Priority**: high

### Summary
Andreas reported that the Side Quest page did not update that Any Game Counts was finalized.

### Lesson
When a completed quest remains in `activeChallenge`, UI surfaces must not let active-state visuals override completed-state visuals. Completed should win over active in card badges, stamps, filters, and CTAs.

### Metadata
- Source: user_bug_report
- Related Files: src/app/challenges/page.tsx, src/components/challenge-deck-browser.tsx
- Tags: sqc, completed-state, active-state, quest-deck

---

## [LRN-20260507-006] Logo/brand asset replacement needs URL versioning

**Logged**: 2026-05-07T15:35:00+02:00
**Category**: best_practice
**Priority**: medium

### Summary
Replacing an existing static logo file at the same path deployed correctly, but Andreas still saw the old topbar logo after refresh.

### Lesson
For visible brand assets, prefer a new versioned filename or explicit URL version bump instead of only overwriting the same public asset path. Browser/mobile/cache layers can keep showing the previous image even when the CDN has the new file.

### Metadata
- Source: user_bug_report
- Related Files: src/components/site-nav.tsx, public/brand/*
- Tags: sqc, static-assets, cache-busting, logo

---

## [LRN-20260507-007] SQC copy should say side quest, not mission

**Logged**: 2026-05-07T15:34:00+02:00
**Category**: correction
**Priority**: medium

### Summary
Andreas corrected homepage copy where a CTA mentioned the next weird chess “mission”.

### Lesson
SQC product language should consistently use “side quest” / “quest”, not “mission”, unless it is only an internal CSS class name.

### Metadata
- Source: user_correction
- Related Files: src/app/page.tsx
- Tags: sqc, copy, product-language

---

## [LRN-20260507-008] SQC large teaser sections should be card-level links

**Logged**: 2026-05-07T15:38:00+02:00
**Category**: correction
**Priority**: medium

### Summary
Andreas asked that clicking anywhere on the homepage coat-of-arms preview section should open the coat-of-arms page.

### Lesson
For SQC homepage promotional/teaser cards, make the whole card clickable when the entire section has one obvious destination. Avoid small nested-only hit targets on mobile.

### Metadata
- Source: user_correction
- Related Files: src/app/page.tsx, src/app/globals.css
- Tags: sqc, mobile-ux, clickable-card, coat-of-arms

---

## [LRN-20260507-009] SQC mobile web polish is not launch-blocking

**Logged**: 2026-05-07T17:54:00+02:00
**Category**: correction
**Priority**: medium

### Summary
Andreas agreed SQC is close to launch ready but explicitly excluded mobile web polish from the final launch-hardening checklist, because the next phase should be a proper SQC mobile app.

### Lesson
Do not treat extensive responsive/mobile web polish as a launch blocker for SQC. Keep final web launch checks focused on product loop, authenticated smoke, verifier confidence, legal/support, and launch copy. Reserve mobile-first UX work for the future app phase.

### Metadata
- Source: user_correction
- Related Files: ROADMAP.md
- Tags: sqc, launch-readiness, mobile-app, roadmap

---

## [CORR-20260507-001] SQC account next-step copy should stay compact and in-theme

**Category**: correction
**Date**: 2026-05-07
**Context**: Andreas reviewed the My Side Quest next-step card after Launch Candidate 1.
**Learning**: Functional status copy that wraps into multiple lines can feel clunky on SQC surfaces; keep compact desktop next-step lines and use the playful SQC voice instead of plain product-instruction prose.
**Applied**: Reworded active quest copy to “on the royal docket … summon the checker” and kept the next-step paragraph on one line at normal desktop widths.

---

## [CORR-20260507-002] Avoid ambiguous “Connect” in signed-out SQC nav

**Category**: correction
**Date**: 2026-05-07
**Context**: Andreas noted that “Connect” can mean wallet, Google, chess account, or sign-in to new users.
**Learning**: Signed-out auth CTAs should name the actual action/provider. Use explicit labels such as “Start with Google” for auth and reserve “Connect chess account” for the username-linking step.
**Applied**: Changed the signed-out top-nav primary CTA from “Connect” to “Start with Google”.

---

## [CORR-20260507-003] SQC signed-out nav should use one neutral auth CTA

**Category**: correction
**Date**: 2026-05-07
**Context**: After changing ambiguous “Connect” to “Start with Google”, Andreas said he did not like “Start with Google” and preferred skipping the extra button.
**Learning**: For SQC top nav, avoid provider-forward or growthy signed-out copy. Use one neutral auth CTA, “Sign In/Up”, and keep the nav lean.
**Applied**: Removed the second signed-out nav button and replaced the pair with one primary `Sign In/Up` button.

---

## [CORR-20260507-004] Footer links need visible separation

**Category**: correction
**Date**: 2026-05-07
**Context**: Andreas reviewed the SQC footer screenshot and asked for a divider between Support and Terms & Conditions.
**Learning**: Adjacent legal/support footer links should not rely only on spacing; add a subtle divider for scanability.
**Applied**: Added a vertical divider before subsequent footer links.

---
## 2026-05-09 — Group Quest URLs need stable IDs, not names

**Category**: correction

Andreas pointed out that Group Quest links should not use room names because names can duplicate or change. Use opaque/stable unique identifiers in routes and keep human-readable names as display labels.

---

## 2026-05-10 — Correction: SQC launch-facing copy should avoid “room”

**Category**: correction
**Context**: Andreas corrected Group Side Quests overview copy where the Prove card said “Each room gets…”.
**Learning**: In launch-facing SQC Group Side Quests UI, use “Group Side Quest” instead of “room” wherever practical. Internal variable/class names can remain room-oriented, but visible copy should match the product term.
**Action**: Replaced visible `room`/`rooms` copy in `/groupquests` with “Group Side Quest(s)”.

---

## 2026-05-10 — Correction: Only first Group Side Quests flow step is clickable

**Category**: correction
**Context**: Andreas corrected the `Create. Play. Prove.` section: only step 1 should be clickable, not steps 2 and 3.
**Learning**: In SQC launch-facing explainer flows, do not make informational steps look clickable unless they actually start the user’s next action. For `/groupquests`, only `Create` should link to creation; `Play` and `Prove` are static explanation cards.
**Action**: Changed overview steps 2 and 3 from links to static articles.

---

## [LRN-20260510-001] correction

**Logged**: 2026-05-10T23:17:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
For SQC Group Side Quests signed-in page, Andreas wants `Create. Play. Prove.` retained at the bottom even after trimming other explainer clutter.

### Details
The signed-in page trim removed the bottom flow section; Andreas corrected that it should stay. Keep the section lightweight and low on the page.

### Suggested Action
When simplifying SQC pages, remove heavy explanatory blocks first but preserve concise product-loop anchors if Andreas finds them helpful.

---

## [LRN-20260511-001] correction

**Logged**: 2026-05-11T16:02:00+02:00
**Priority**: low

Andreas corrected the Multiplayer Side Quest flow: it must include an explicit **Invite** stage between Create and Play.

**Do differently**: For multiplayer flows, always represent the social handoff/invite step explicitly instead of folding it into Create.

## [LRN-20260511-002] correction

**Logged**: 2026-05-11T18:45:00+02:00
**Priority**: low

Andreas corrected that changing a CTA away from `Browse` is not enough if nearby body copy still says `Browse`.

**Do differently**: When terminology is changed for intent/tone, grep the full page for the old word and update nearby supporting copy too.

## [LRN-20260511-001] correction

**Logged**: 2026-05-11T19:36:00+02:00
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
When Andreas asks about removing a section based on a screenshot, confirm the exact section if there is any ambiguity instead of guessing from nearby layout context.

### Details
I removed the `/groupquests/create` create-flow checklist/explainer section, but Andreas corrected that it was the wrong section.

### Suggested Action
For screenshot-based deletion requests, name the target section before deleting or remove only if the requested UI element is unambiguous.

### Metadata
- Source: user_feedback
- Related Files: src/app/groupquests/create/page.tsx
- Tags: screenshot-feedback, ui-removal

---

## [LRN-20260511-002] correction

**Logged**: 2026-05-11T19:54:00+02:00
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
Multiplayer Quest creation should support selecting multiple side quests immediately; a single `First side quest` dropdown is misleading.

### Details
Andreas flagged the single side-quest dropdown as problematic. The create flow should expose selected side quests up front and use a checkbox picker or equivalent multi-select pattern.

### Suggested Action
For future Multiplayer Side Quest work, model quests as an ordered/selected collection, not a single primary quest, unless explicitly designing a one-quest mode.

### Metadata
- Source: user_feedback
- Related Files: src/components/group-quest-draft-builder.tsx
- Tags: multiplayer-quests, create-flow, multi-select

---

## [LRN-20260511-001] correction

**Logged**: 2026-05-11T21:58:00+02:00
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
`beforeunload` alone does not protect unsaved form state during Next.js internal link navigation.

### Details
Andreas reported that the unsaved-exit warning on `/groupquests/create` only appeared on reload, not when clicking site nav links such as Home. Next.js client-side links can bypass a normal reload prompt, so route/link clicks need a separate in-app guard.

### Suggested Action
For unsaved form protection in Next.js App Router, combine `beforeunload` with a client-side click/navigation guard for same-origin anchors and optionally a router-aware guard when framework APIs support it.

### Metadata
- Source: user_feedback
- Related Files: src/components/group-quest-draft-builder.tsx
- Tags: nextjs, unsaved-form, navigation-guard

---
## [LEARN-20260514-001] SQC mobile language canon: Side Quest / Coat of Arms

**Logged**: 2026-05-14T12:45:00+02:00
**Category**: correction
**Priority**: high
**Status**: active
**Area**: product-language

### Summary
Andreas corrected SQC mobile language: use **Side Quest** and **Coat of Arms**, not generic/internal wording like mission, coat, etc.

### What to do differently
- UI labels, docs, screenshots, roadmap text, and user-facing copy should say `Side Quest` and `Coat of Arms`.
- Avoid `mission`, `coat`, `badge`, or shorthand unless describing internal implementation or historical context.
- Treat terminology consistency as part of SQC mobile UI quality gates.

### Source
Andreas Telegram instruction, 2026-05-14 12:45 CEST.

---

## [LRN-20260518-001] correction

**Logged**: 2026-05-18T18:51:00+02:00
**Priority**: medium
**Status**: pending
**Area**: mobile-ui

### Summary
When Andreas asks for mobile to match the website homepage, do not compress it into a generic app dashboard.

### Details
The first SQC mobile redesign kept the bottom nav direction but made the rest feel unlike the web homepage and exposed an offline-preview error card in the review shell. The correct move is to preserve the website homepage sections and exact copy structure first: hero, CTAs, Where to begin, signed-out explainer, and multiplayer callout.

### Suggested Action
For website-parity mobile slices, inspect the source web page and port its visible section hierarchy before inventing app-specific cards. Hide noisy technical fallback states from normal review screenshots unless they are the actual feature under review.

### Metadata
- Source: user_feedback
- Related Files: apps/mobile/App.tsx, src/app/page.tsx
- Tags: sqc, mobile, design-parity

---

## [LRN-20260518-002] correction

**Logged**: 2026-05-18T19:47:00+02:00
**Priority**: medium
**Status**: pending
**Area**: messaging

### Summary
Telegram screenshot delivery was unreliable when using repo artifact paths directly.

### Details
Andreas repeatedly did not receive screenshots until asking again. Repo artifact `MEDIA:` paths may not reliably render as Telegram attachments in this context.

### Suggested Action
Before sending screenshots to Telegram, copy the final image into OpenClaw's media/outbound area and reference that copied path in the assistant reply.

### Metadata
- Source: user_feedback
- Related Files: artifacts/mobile-real-coat-hero-2026-05-18/02-real-coats-home-three.png
- Tags: telegram, media, screenshots

---

## 2026-05-19 — SQC mobile palette correction
- Context: Andreas corrected the first post-feedback mobile palette pass: screenshots had a white background.
- Learning: “Not too dark” did not mean a white shell; SQC web/mobile should keep a dark-gold fantasy base with warm parchment/gold accents.
- Action: Rebalanced mobile palette back to dark-gold in commit 04a53dd and captured fresh screenshots.

## 2026-05-19 — SQC mobile web-parity correction
- Context: Andreas said the dark-gold mobile pass was better but still very different from the website.
- Learning: Use a live website mobile screenshot as visual reference before tuning native app proportions. Matching palette alone is insufficient; top nav, hero scale, card treatment, background watermark/glow, and spacing matter.
- Action: Added website-style top nav, faint SQC logo watermark, web-like hero card/glow/typography, fixed bottom padding, then tightened proportions in commits 1a30776 and 73b0dc0.

## 2026-05-19 — SQC mobile gradient-only refinement
- Context: Andreas asked to try gradients like the website after rejecting structural top-bar changes.
- Action: Kept layout unchanged and added only decorative website-style gradient/glow color treatment to background and existing hero cards in commit c2dba58.
- Guardrail: No new nav/top bar or structural changes; screenshots verified individual Home screen still has existing content + bottom nav only.

## [LRN-20260520-001] correction

**Logged**: 2026-05-20T09:34:00+02:00
**Priority**: medium
**Status**: pending
**Area**: communication

### Summary
When Andreas asks for an "SDK for testing" in the SQC mobile context, confirm whether he means a mobile test build/APK before creating developer tooling.

### Details
I interpreted "SDK" as an internal testing SDK and built dev tooling, but Andreas wanted an SQC Mobile APK to test.

### Suggested Action
For ambiguous acronyms around mobile/testing, ask one concise clarification or infer from active mobile context and produce the installable artifact first.

### Metadata
- Source: user_feedback
- Related Files: testing-sdk/, docs/SQC_TESTING_SDK.md
- Tags: sqc, mobile, apk, clarification

## [LRN-20260520-002] correction

**Logged**: 2026-05-20T09:40:00+02:00
**Priority**: high
**Status**: pending
**Area**: mobile

### Summary
SQC Mobile APK builds previously used Homebrew Java 17 explicitly, not `/usr/libexec/java_home`.

### Details
I incorrectly concluded no Java runtime was available because macOS `java_home` failed. The working JDK exists at `/opt/homebrew/opt/openjdk@17`, and previous APKs were produced locally by exporting `JAVA_HOME` to that path. Existing APK artifacts are in `cc/artifacts/`.

### Suggested Action
For SQC Android local builds, use `JAVA_HOME=/opt/homebrew/opt/openjdk@17` and do not rely on `/usr/libexec/java_home`.

### Metadata
- Source: user_feedback
- Related Files: apps/mobile/android, artifacts/*.apk
- Tags: sqc, mobile, apk, java, gradle

## 2026-05-21 — Correction: APK links should use Vercel URL, not Telegram MEDIA path
Category: correction
Andreas corrected APK delivery: for SQC mobile test builds, provide a clickable Vercel-hosted URL as before, not only a local `MEDIA:` attachment path. Preferred quick path when EAS quota is blocked: place APK under `public/downloads/`, run a Vercel preview deploy, verify the `/downloads/*.apk` URL with `curl -I`, then send the URL.

## 2026-05-21 — Correction: SQC APK login needs EAS/original signing key
Category: correction
The locally re-signed SQC APK can break Google/Clerk login because Android OAuth is tied to package name plus signing certificate SHA fingerprints. For SQC mobile APK fixes when EAS quota is blocked, download EAS credentials, patch/export current JS bundle, then re-sign with the EAS keystore. Verify SHA1 `F4:E0:C8:40:95:18:CA:44:7E:1F:D6:6D:86:5A:C3:1A:B5:7D:E3:21` before sharing.

## [LRN-20260522-001] correction

**Logged**: 2026-05-22T15:32:30+02:00
**Priority**: medium
**Status**: pending
**Area**: workflow

### Summary
When Andreas says UI work for SQC mobile, default to native Android/iOS app review, not Expo web preview.

### Details
I prepared an Expo web preview for SQC mobile UI review, but Andreas clarified he wants to work on the APP (Android/iOS), not web UI.

### Suggested Action
For SQC mobile app UI sessions on the Mac mini, first check Android/iOS simulator/device availability and run native app paths (`expo run:android`, `expo run:ios`, EAS/APK, or Expo Go/dev client as appropriate) before considering web preview.

### Metadata
- Source: user_feedback
- Related Files: apps/mobile/App.tsx, apps/mobile/package.json
- Tags: sqc, mobile, native, workflow

---

## [LRN-20260522-003] SQC mobile Apple Sports means dense utility, not themed cards

**Logged**: 2026-05-22T17:48:00+02:00
**Priority**: medium
**Status**: active
**Area**: mobile-design

### Summary
Andreas corrected the SQC mobile direction: the Apple Sports reference should drive a dense native utility/feed layout, not website-like fantasy cards or decorative glow treatments. Top menu/navigation chrome was disliked.

### What to do differently
For SQC mobile first-screen work, bias toward Apple Sports patterns: compact brand/context header, minimal/no heavy navigation, dense live rows/tables, restrained navy surfaces, small status labels, and the Coat of Arms as a small team-logo-style marker rather than a large decorative framed/glowing hero asset.

### Metadata
- Source: user correction
- Related Files: apps/mobile/App.tsx
- Tags: sqc-mobile, apple-sports, design-direction

---

## [LRN-20260522-004] SQC mobile must be function-led and use website colors

**Logged**: 2026-05-22T17:53:00+02:00
**Priority**: high
**Status**: active
**Area**: mobile-design

### Summary
Andreas corrected the SQC mobile direction again: `Live Board` is vague/non-product language, the app must always use the SQC website color scheme, and the team needs to understand what functions the app should offer before continuing UI variants.

### What to do differently
Before changing SQC mobile UI, anchor it in launch-critical functions: current Side Quest status/check/proof, My Multiplayer Side Quests, Official Multiplayer Side Quests, chess account readiness, and proof/Coat of Arms access. Use website color tokens (`#060507`, `#fff7e8`, `#c7bda9`, `#f5c86a`, `#ff5f9f`, `#60f0af`, `#76a9ff`, `#e87922`, `#ff7a66`) and avoid vague labels such as `Live Board`.

### Metadata
- Source: user correction
- Related Files: apps/mobile/App.tsx, docs/SQC_MOBILE_APP_FUNCTION_RESEARCH_2026-05-22.md
- Tags: sqc-mobile, product-scope, design-system, apple-sports

---

## [LRN-20260522-005] SQC mobile reset: logged-in app definition first

**Logged**: 2026-05-22T18:02:00+02:00
**Priority**: high
**Status**: active
**Area**: mobile-product

### Summary
Andreas reset the SQC native app direction: start over from scratch, keep nothing from previous mobile UI experiments, and focus 100% on logged-in user content/functionality.

### What to do differently
Do not iterate from the previous native UI as a baseline. Treat it as disposable. Define and build around logged-in user jobs: current Side Quest, check latest games, proof/Coat of Arms, My Multiplayer Side Quests, Official Multiplayer Side Quests, and account readiness. Marketing/website parity is out of scope for the app center.

### Metadata
- Source: user correction
- Related Files: docs/SQC_MOBILE_APP_DEFINITION_RESET_2026-05-22.md
- Tags: sqc-mobile, reset, logged-in-first, product-definition

---

## 2026-05-22 — SQC mobile Coat of Arms glow should be alpha-mask glow, not duplicate art

Andreas showed the mobile screen and pointed back to `https://sidequestchess.com/challenges` because the glow still looked hard/dirty. The important distinction: the website challenge-card treatment reads like a soft colored glow attached to the badge art, not a duplicated tinted badge and not a separate oval halo. For React Native Android, generate blurred glow PNGs from the Coat of Arms alpha masks and tint those behind the clean badge image.


## [LRN-20260522-001] correction

**Logged**: 2026-05-22T20:24:00+02:00
**Priority**: high

### Summary
When reviewing SQC mobile `Current Side Quest`, Andreas explicitly wanted the active non-completed Solo Side Quest state. I accidentally optimized the completed/latest-proof state because the dev preview account had a completed latest receipt unrelated to the active quest, which made the Home card display completed-result copy.

### What to do differently
For mobile Home UI review, keep the emulator preview account aligned with the state being designed. Only let latest receipt/proof affect the Current Side Quest card when `latestReceipt.challengeId === activeQuest.id`; otherwise show active in-progress state.

---

## [LRN-20260522-002] correction: SQC mobile detail rows must avoid obvious/redundant metadata
- **Date**: 2026-05-22
- **Category**: correction
- **Context**: Andreas corrected the Current Active Side Quest detail screen: `State` is redundant because the screen is active by context; `Check platform` is already known from the account header; `Result needed` was unclear; layout still was not Apple Sports-tight enough.
- **Do differently**: For SQC mobile detail/status screens, prefer dense, immediately useful rows only. Avoid explanatory product/database labels unless the user cannot infer them from context. Optimize for scoreboard-like scan speed.

## [LRN-20260530-001] correction

**Logged**: 2026-05-30T11:12:00+02:00
**Priority**: medium

Andreas rejected the SQC mobile create-side-quest header/coat experiment as totally wrong. Do not make large structural header changes from a single screenshot when the requested fix is likely local spacing/overlap. Prefer the smallest reversible UI fix first, and if trying an alternate visual concept, describe it as a test before deploying widely.

## [LRN-20260530-002] correction

**Logged**: 2026-05-30T11:45:00+02:00
**Priority**: medium

Andreas rejected the first mobile Multiplayer Lobby experiment because the top stat/tab buttons made the screen feel wrong. For this screen, prefer stacked list sections with compact rows and a simple “More” button when a list is long, rather than prominent navigation/stat buttons.

