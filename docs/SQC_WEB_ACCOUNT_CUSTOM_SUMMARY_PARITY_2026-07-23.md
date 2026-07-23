# SQC web Account Custom Side Quest summary parity — 2026-07-23

## DONE

- Sole reference: shipped Android v338 (`0.1.338`, versionCode `338`, package `com.sidequestchess.app`; release APK SHA-256 `adfbecbc922bc75828539f5f21b70346ad8853a9de96a01109211ef42238e228`).
- Reconciled clean branch HEAD `2f4275bac5e350dc2da2c1d88dd4ceca313700d2`, `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, production deployment `dpl_3NQMTSfp6rQgB47oVHatjN6xPQrP`, the v338 `ActiveScreen` dispatcher, and the July 13 exhaustive screen/state/action matrix before selecting this slice.
- Corrected the authenticated Account Custom Side Quest summary to match reachable v338 `AccountSoloSideQuestSection`: it now distinguishes playable and draft quests from canonical lifecycle data while retaining the truthful total-made count and empty state.
- Archived quests remain included in the total made count but are not mislabeled playable; no client-supplied identity or fabricated live account data was introduced.

## VERIFIED

- Strict vertical TDD: focused RED failed because the lifecycle summary contract and rendered row were absent; focused GREEN and the complete Account stats test file pass.
- Rendered production-component coverage proves `1 playable · 1 draft · private by default`, `3 made`, and the exact `/custom-side-quests` destination from mixed published/draft/archived input.
- Disposable local visual fixture was removed before final gates. At 390×844 and 1440×900 the production row returned HTTP 200, stayed within a 368×54 / 518×54 box, had zero console/page errors, and no horizontal overflow. Fresh inspection found no row clipping, overlap, broken image, or unreadable contrast. Captures: `/tmp/sqc-account-custom-summary-mobile.png` (`a4bc3ed330a067bd7ae2f410caca7f3884850e6bb36bec7d259827ae145cb2f6`) and `/tmp/sqc-account-custom-summary-desktop.png` (`c09be97c67d2a67951419cbd2aa4e6dedaaa20c52c877dc4026ba9f7160e454d`).
- Final full tests, lint, root/mobile typechecks, production build, diff checks, unsafe scan, exact preview/browser checks, and independent exact-HEAD review are recorded in PR #84 after commit.

## NEXT

- Reconcile current main/open PRs again and continue with the highest-value still-open v338 state. Keep authenticated matched-state visual gates and Terms adoption fail-closed.

## NEEDS USER INPUT

- A safe disposable non-production authenticated browser identity is still unavailable, so the mandatory same-account full-screen Android-v338 ↔ exact-preview Account capture cannot be produced. This slice must remain unmerged and undeployed; component evidence is not presented as full authenticated screenshot parity.
