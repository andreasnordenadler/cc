# Web Custom Builder Fresh-State and Template Parity — 2026-07-20

**DONE**

- Reconciled the stale July 13 audit against `origin/main` and merged work through PR #82; Android v338’s reachable Custom builder still opened empty while the web silently preloaded two unrelated No-castle rules.
- Fresh web builders now open with zero conditions and the same honest empty-state action as Android v338.
- Replaced the web-only template set with Android v338’s four templates. Choosing a template now replaces the rule stack with its exact single condition and sets the matching Side Quest name.
- Existing owned edits, local-draft restoration, manual condition editing, server-derived ownership, and the six-condition cap remain unchanged.

**VERIFIED**

- Android reference: reachable builder dispatcher and `openCustomEditor` / `CUSTOM_QUEST_TEMPLATES` / `applyCustomQuestTemplate` contracts in `apps/mobile/App.tsx` v338.
- Strict TDD: focused RED reproduced the hidden `2/6` default and missing Android template contract; focused GREEN covers fresh state, all four template payloads, existing saved-rule editing, and template interaction.
- Matched-state browser evidence uses the real signed-out local-draft production component at the Android Pixel viewport; no fabricated account, quest, progress, or provider data.
- Repository test, lint, typecheck, production build, diff/unsafe scans, preview mobile/desktop browser checks, and independent exact-commit review are release gates for this slice.

**NEXT**

- Reconcile the latest mainline and select the next still-open functional or authenticated-data parity gap. Paired authenticated screenshot coverage remains limited by the absence of a disposable authenticated browser identity.

**NEEDS USER INPUT**

- None for this slice.
