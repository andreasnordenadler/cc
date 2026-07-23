# SQC Web Multiplayer Create Source Accessibility Parity — 2026-07-23

## DONE

- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, production deployment `dpl_3NQMTSfp6rQgB47oVHatjN6xPQrP`, and the Android v338 runtime dispatcher before selecting this slice.
- Preserved Android v338's reachable Multiplayer creator source chooser: Official, central source swap, and Community remain real controls with the same counts, styling, selection state, filtering, preselection, and paging behavior.
- Replaced the web's incomplete ARIA tab contract with one truthful labeled pressed-button group. The chooser does not implement a tabpanel/roving-tab keyboard contract, and its central source-swap control was a non-tab child that caused a serious `aria-required-children` accessibility violation.
- Left Custom creation, public catalog navigation, the legacy draft builder, identity derivation, and all mutation payloads unchanged.

## VERIFIED

- Strict RED/GREEN reproduced the incomplete tablist in the rendered production form, then proved the official and Community pressed states and the absence of obsolete tab semantics.
- The existing exact-community preselection regression was updated to preserve its behavior assertion under the truthful group contract.
- Final repository, independent-review, preview, browser, visual, and accessibility evidence is recorded in PR #84 for the exact commit produced by this slice.

## NEXT

- Reconcile current main and open PRs, then continue the highest-value still-open Android v338 state that can be proved without fabricated account or Multiplayer data.

## NEEDS USER INPUT

- None for this bounded slice. Cumulative authenticated matched-state and Terms legal-adoption blockers remain outside this source-chooser correction, so PR #84 remains draft and must not be merged or promoted.
