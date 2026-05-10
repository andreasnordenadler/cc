
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
