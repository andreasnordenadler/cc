# Web Custom Builder Unsaved-Changes Parity — 2026-07-20

**DONE**

- Reconciled the stale 2026-07-13 audit against `origin/main`; the remaining Custom builder discard-confirmation gap was still present.
- Matched Android v338’s reachable builder behavior: changed fields or rules now require confirmation before an in-app link discards work, while an unchanged loaded builder closes directly and successful saves navigate without a false warning.

**VERIFIED**

- Android reference: installed `com.sidequestchess.app` version `0.1.338` / code `338`; exact dialog copy observed on the reachable builder.
- TDD: focused RED failed because the dirty-state contract was absent; focused unit and real-browser GREEN passed.
- Matched viewport evidence: `/tmp/sqc-parity-evidence/android-v338-discard-dialog-390x844.png` and `/tmp/sqc-parity-evidence/web-builder-390x844.png`; the browser confirmation is platform-native and its exact type/copy/keep-editing/discard outcomes are asserted through Playwright.

**NEXT**

- Reconcile the latest mainline and select the next still-open functional parity gap from the full route/state/action matrix.

**NEEDS USER INPUT**

- None.
