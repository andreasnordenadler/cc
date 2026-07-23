# SQC Web Multiplayer Create Option-Card Parity — 2026-07-23

## DONE

- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, production source/deployment alignment, and the Android v338 runtime dispatcher before selecting this slice.
- Replaced the web Multiplayer creator's raw Access and Games allowed selects with Android v338's reachable option-card groups.
- Preserved the exact server payload values and defaults: `public` / `unlisted-link` / `private-key` and `both` / `lichess` / `chesscom`.
- Matched Android's visible labels, helper text, and selected states for these two groups.
- Preserved the web's pre-existing conditional invite-code input and payload behavior; Android v338 generates private invite credentials instead of exposing that input.
- Left identity derivation, quest selection, dates, advanced rules, submission, and every unrelated form unchanged.

## VERIFIED

- Strict RED/GREEN proved the production form lacked Android's option-card groups, then proved all six choices, helper text, selected state, and removal of the two raw selects.
- Full tests, lint, root/mobile typechecks, production build, diff/unsafe scans, and fresh independent review passed locally before push.
- Exact preview and desktop/mobile browser evidence are added to PR #84 only after the provider deployment is verified.

## NEXT

- Reconcile current main and open PRs, then continue the highest-value still-open Android v338 state that can be proved without fabricated account or Multiplayer data.

## NEEDS USER INPUT

- None for this bounded slice. Cumulative authenticated matched-state and Terms legal-adoption blockers remain outside this control-parity correction, so PR #84 remains draft and must not be merged or promoted.
