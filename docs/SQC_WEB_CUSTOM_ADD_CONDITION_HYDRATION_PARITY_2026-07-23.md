# Web Custom Add Condition hydration parity — 2026-07-23

## DONE

- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, the July 13 exhaustive audit, and Android v338's reachable Custom builder.
- Fixed the highest-ranked open functional regression: an immediate **Add Condition** press could occur before React hydration and be discarded while the server-rendered control still looked actionable.
- The control is now truthfully disabled until its client action is ready, then enables and creates the first editable condition. Template, saved-edit, six-condition, local-draft, and server-derived ownership contracts are unchanged.
- The newly reachable piece editor now stacks its helper copy in the Custom-only layout instead of overlapping King and Queen labels at the Android viewport; Multiplayer option cards keep their existing two-column action layout.

## VERIFIED

- Strict RED reproduced the exact-preview failure: after the first press the builder stayed at `0/6` and never exposed the `Condition 1` selector.
- Focused GREEN against the production build creates `Condition 1`, selects the Android-compatible piece-state editor, chooses both rooks, and renders the exact summary.
- Static form tests, lint, typecheck, production build, full repository/browser gates, exact-preview evidence, and independent exact-head review are required before commit/release; immutable CI/preview results are recorded on draft PR #84.
- This is a signed-out local-draft state using the real production component. No fabricated identity, quest, progress, standing, or provider data is involved.

## NEXT

- Reconcile current main/open PRs and continue the highest-value still-open Android v338 state that can be proved without fabricated authenticated data.

## NEEDS USER INPUT

- None for this slice. PR #84 remains draft and unmerged because cumulative authenticated matched-state and Terms legal-adoption gates are outside this correction.
