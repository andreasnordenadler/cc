# Web Home Trophy Cabinet expansion parity — 2026-07-22

## Reference and reconciliation

- Reference: shipped Android v338 (`0.1.338`, versionCode `338`), reachable authenticated `TodayDashboard` in `apps/mobile/App.tsx:2273-2325`.
- Android state: authenticated Home with more than five mixed Solo and Multiplayer Trophy Cabinet items. Android shows five rows first, then a real `Show all Trophy Cabinet items` / `Show fewer Trophy Cabinet items` action while retaining every item destination.
- Existing audit: `FULL_WEB_ANDROID_PARITY_MATRIX_2026-07-13.md` on documentation PR #27, Home row 84 and screenshot state H08.
- Fresh reconciliation: `origin/main` at `4b383fe1a43614e8a83b38618b161445143aab1c`; open PR #84 is this parity lane and PR #27 is documentation-only. Current web Home rendered all supplied Trophy Cabinet rows at once, so H08 remained open and was not in flight elsewhere. Production remains on Vercel deployment `dpl_3NQMTSfp6rQgB47oVHatjN6xPQrP`, behind current `origin/main`; the canonical route is healthy but no production promotion is authorized for this blocked draft PR.

## DONE

- Matched Android v338's compact five-row authenticated Home Trophy Cabinet preview.
- Removed the production Home loader's five-row truncation so rows six through twelve reach the view model instead of disappearing before render.
- Added a native browser disclosure with Android's exact show-all/show-fewer labels and a truthful remaining-item count.
- Preserved every mixed Solo, official Multiplayer, and Community Multiplayer row's exact proof/detail destination.
- Preserved empty and one-to-five states and the separate full Trophy Cabinet route.

## VERIFIED

- Strict RED/GREEN: the six-row rendered production-component test failed because the disclosure was absent, then passed after the bounded Home change; a second production-loader test failed because the Home loader seam was missing, then passed after the route was migrated away from its five-row cap.
- Focused authenticated Home and Home-loader suites pass.
- The first independent review correctly blocked the unreachable disclosure because the production route still requested only five rows; that blocker is fixed. A fresh exact-envelope review is required after full gates.

## NEXT

- Resolve authenticated matched-state evidence for H07 and H08, then rerun the exact-preview and exact-HEAD release gate before merging PR #84.
- After release blockers are resolved, reconcile the next highest still-open matrix item against current `origin/main` and open PRs.

## NEEDS USER INPUT

- A safe disposable authenticated parity identity or approved non-production fixture path is required for matched Android-v338/web H07 and H08 screenshots at 390×844. No production identity or fabricated trophies, Multiplayer rooms, users, or progress will be used.
- PR #84 also remains blocked by the separate Terms launch-draft owner/legal decisions recorded in its PR body.
