# SQC web Multiplayer advanced option-card parity — 2026-07-24

## DONE

- Reconciled clean branch state with `origin/main` `f20dc1dcd4c787d85b1899cb889c3621f7a07342`, open PRs #27/#2, current production source, Android v338's reachable dispatcher, and the exhaustive July 13 matrix.
- Replaced the Multiplayer create form's web-only advanced selects with Android v338's exact Time control, Rated setting, and Player color option cards and copy.
- Added Android-equivalent expand/collapse behavior with explicit disclosure semantics while preserving canonical payload values, defaults, authentication, picker, schedule, and creation behavior.

## VERIFIED

- Strict browser and CSS RED/GREEN cycles proved option selection, selected state, expansion, collapse, geometry, and the absence of browser selects.
- All 443 unit/route/component tests, lint (0 errors; 4 existing warnings), root/mobile typechecks, production build, and `git diff --check` passed after the final behavior edit.
- Exact preview `https://cc-2qmj39fia-andreas-nordenadlers-projects.vercel.app` passed all 21 public browser checks. The changed screen passed at 390×844 and 1440×900 with HTTP 200, three named rule groups, 40px-or-taller bounded cards, real Blitz selection, zero selects, zero horizontal overflow, and zero console/page errors.
- Authenticated submission behavior remains covered by production payload/route tests; no fabricated account or Multiplayer state was used.

## NEXT

- Finish exact-HEAD review, PR/CI, and production source-alignment gates, then reconcile the matrix and select the next still-open Android v338 state.

## NEEDS USER INPUT

- None.
