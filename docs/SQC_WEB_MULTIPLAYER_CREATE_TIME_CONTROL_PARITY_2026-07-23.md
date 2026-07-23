# SQC web Multiplayer advanced time-control parity — 2026-07-23

## DONE

- Reconciled clean branch state, current `origin/main` (`4b383fe1a43614e8a83b38618b161445143aab1c`), open PRs #84/#27/#2, production readiness, Android v338's runtime dispatcher, and the July 13 exhaustive matrix before selecting this slice.
- Replaced the web-only exact presets `Rapid 10+0` and `Blitz 5+0` with Android v338's complete advanced time-control set: `Any time control`, `Bullet`, `Blitz`, `Rapid`, and `Classical`.
- Kept rated, color, access, provider, date, quick-duration, picker, payload, and server-side proof validation behavior unchanged.
- Corrected the advanced selects' browser-default white styling with a narrowly scoped dark, bounded control treatment.

## VERIFIED

- Strict TDD recorded a focused option-contract RED/GREEN cycle, then a rendered-style RED/GREEN cycle after the exact preview exposed browser-default white selects.
- Full 441-test suite, lint (0 errors; 4 existing warnings), root/mobile typechecks, production build, diff/unsafe checks, and fresh exact-HEAD independent review passed.
- Exact behavior preview: `https://cc-6ohgusamt-andreas-nordenadlers-projects.vercel.app` (`c01a9f6c463c92da7b86ccb1b1dd294fb944535b`, deployment `dpl_A95Umq7shfzuXDSCXe3K4e4CnU3w`); final documentation-head preview: `https://cc-r2vs1bcon-andreas-nordenadlers-projects.vercel.app` (`9bc1eb6cb4c062e2d19cfbc7daeddfa12badf1da`, deployment `dpl_GYT52hbQCexG474P2M7Lx44dMztq`).
- At 390×844 and 1440×900, the real production form returned HTTP 200, rendered the exact five Android options, kept all three selects within the form at 38px height, had zero console/page errors, and had zero horizontal overflow. Fresh screenshots were captured and inspected after the styling correction.
- The exact final-preview public browser matrix passed all 19 desktop/mobile checks. An earlier unrelated Custom-template interaction timeout passed immediately in isolation and again in the fresh complete matrix.

## NEXT

- Reconcile current main/open work again and select the next still-open v338 state/action. Keep authenticated matched-state claims blocked unless a safe disposable parity identity becomes available.

## NEEDS USER INPUT

- None. This slice remains in draft PR #84 and is not approved for production while the existing authenticated matched-state and legal-adoption gates remain open.
