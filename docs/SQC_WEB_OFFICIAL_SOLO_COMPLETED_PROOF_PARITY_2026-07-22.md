# Web Official Solo Completed-Proof Parity — 2026-07-22

**DONE**

- Reconciled the July 13 full parity matrix against `origin/main`, open PRs, and this branch through `29302f50`. The original P0 action/data findings are fixed or already in PR #84; the highest remaining bounded reachable action gap was the completed Official Solo detail’s missing accepted-proof destination.
- A signed-in completed Official Solo detail now derives the latest passed receipt from authenticated server metadata and opens the existing signed public proof route.
- Legacy completion IDs without a passed attempt do not generate a plausible receipt. They show an honest no-receipt state while retaining the Android reset capability.

**VERIFIED**

- Android v338 reference: `CompletedQuestProofCard` in `apps/mobile/App.tsx` exposes proof details/open-link actions and reset for a completed Official Solo Side Quest.
- Strict vertical TDD: the proof-path contract failed before implementation, then passed; a second rendered production-component test failed before extraction, then passed for accepted-receipt and legacy-no-receipt states.
- Identity and receipt data remain server-derived. The client receives only the signed proof destination; no user identity or game payload is accepted from the browser.
- Authenticated matched-viewport runtime evidence remains unavailable because this environment has no safe disposable browser identity. Rendered production-component coverage is the changed-state evidence; public browser checks are regression evidence only.

**NEXT**

- Reconcile the next current-main delta and select the next still-open reachable Android v338 state/action. Keep visual-only work behind equivalent-state Android/web evidence.

**NEEDS USER INPUT**

- Provide or authorize a safe disposable non-production authenticated browser identity before merge. PR #84 must remain draft while changed authenticated states cannot receive the required matched-viewport gate.
