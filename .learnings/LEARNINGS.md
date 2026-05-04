# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260426-001] best_practice

**Logged**: 2026-04-26T20:48:00+02:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
Before touching domain backup configuration, check the latest same-day memory tail for fresh user clarifications.

### Details
During SQC Phase 10, memory already recorded Andreas's clarification that `sqchess.com` should stay a simple GoDaddy redirect to `sidequestchess.com`, not a Vercel-hosted backup. A burst briefly re-added `sqchess.com`/`www.sqchess.com` to Vercel before noticing the clarification; the mistaken Vercel add was immediately removed.

### Suggested Action
For active domain/deploy tasks, inspect the relevant same-day memory tail in addition to roadmap/control docs before making external configuration changes.

### Metadata
- Source: self_review
- Related Files: ROADMAP.md, docs/SQC_PRODUCTION_DOMAIN_WIRING_BLOCKED_ON_DNS_2026-04-26.md
- Tags: dns, vercel, memory

---
