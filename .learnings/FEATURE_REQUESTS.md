# Feature Requests

Capabilities requested by the user.

---

## [FR-20260507-001] SQC full victory scroll image sharing

**Logged**: 2026-05-07T10:44:30+02:00
**Priority**: high
**Status**: implemented
**Area**: frontend

### Summary
Andreas asked for the completed quest victory scroll, including text and badge/seal, to be generated as one shareable image while looking like the current UI.

### Details
The existing share flow had DOM text plus image pieces. Implemented a full vertical server-generated proof image so native sharing can send one complete victory scroll image.

### Metadata
- Source: conversation
- Related Files: src/app/api/og/proof/[token]/route.tsx, src/components/share-proof-actions.tsx
- Tags: sqc, sharing, proof-image

---

## [FR-20260507-002] SQC completed quest reset

**Logged**: 2026-05-07T11:10:00+02:00
**Priority**: high
**Status**: implemented
**Area**: frontend

### Summary
Andreas requested a completed-quest reset button so users can undo a completion and repeat the quest.

### Details
The reset is destructive: it removes the completion, proof receipt, coat of arms unlock, and points for that quest. UI must require clear confirmation and say the action cannot be undone.

### Metadata
- Source: conversation
- Related Files: src/components/reset-quest-control.tsx, src/app/actions.ts
- Tags: sqc, quest-reset, destructive-confirmation

---
