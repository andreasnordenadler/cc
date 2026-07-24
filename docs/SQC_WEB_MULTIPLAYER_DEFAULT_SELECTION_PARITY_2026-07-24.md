# SQC web Multiplayer default selection parity — 2026-07-24

## DONE

- Reconciled `origin/main`, open PRs, production readiness, Android v338's reachable Multiplayer create dispatcher, and the exhaustive July 13 parity matrix.
- Matched Android v338's direct-create state by preselecting the first three Official Side Quests while preserving exact-resource preselection, the four-quest cap, source provenance, and user removal/clear controls.

## VERIFIED

- Strict RED reproduced the empty `0/4` web draft against Android's `bootstrap.challenges.slice(0, 3)` contract; focused GREEN proves exactly the first three Official choices are selected and the fourth remains available.
- Production-component and browser regressions cover the initial `3/4` tray, clearing, re-adding after hydration, and zero horizontal overflow. Final repository, preview, matched-viewport, CI, and exact-HEAD review gates remain binding before release.

## NEXT

- Reconcile current main/open work and continue the highest-value still-open Android v338 state with truthful runtime evidence.

## NEEDS USER INPUT

- None for this bounded public create-state correction.
