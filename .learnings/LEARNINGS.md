
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
