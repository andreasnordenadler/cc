
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
