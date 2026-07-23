# Web Home active Multiplayer expansion parity — 2026-07-22

## Reference and reconciliation

- Reference: shipped Android v338 (`0.1.338`, versionCode `338`), reachable `TodayDashboard` in `apps/mobile/App.tsx`.
- Android state: authenticated Home with more than five joined/hosted active Multiplayer Side Quests. Android renders five rows first and a real `Show all` / `Show fewer` action (`App.tsx:2316-2318` for the same Home disclosure pattern).
- Existing audit: `FULL_WEB_ANDROID_PARITY_MATRIX_2026-07-13.md` on PR #27, Home row 81 and screenshot state H07.
- Fresh reconciliation: `origin/main` at `4b383fe1a43614e8a83b38618b161445143aab1c`; open PR #84 contains this parity lane and PR #27 is documentation-only. The current Home helper still truncated active rows with `slice(0, 5)`, so the audit finding remained present and was not in flight elsewhere.

## DONE

- Preserved every active joined/hosted row returned by the authoritative server loader instead of silently dropping row six and beyond.
- Kept Android v338's compact five-row Home preview.
- Added a native browser disclosure with truthful remaining count and `Show all` / `Show fewer` labels, while every exact-resource detail link remains reachable.
- Preserved empty, one-to-five, hosted, joined, official/community, and finished-exclusion behavior.

## VERIFIED

- Strict RED/GREEN evidence: the six-active-row view-model test failed against the five-row truncation, then passed after removing it; the rendered Home/CSS test failed before the disclosure styling, then passed.
- Focused tests: 12/12 pass.
- Full suite: 398/398 pass.
- Lint: 0 errors; four existing warnings.
- Root and mobile TypeScript checks pass.
- Next.js production build passes.
- `git diff --check` passes.

## NEXT

- Resolve the existing authenticated matched-state visual gate before release: H07 requires the same safe account state on Android v338 and the exact web preview, including the collapsed and expanded six-row states at 390×844.
- Continue with the highest-ranked still-open matrix item after reconciling current `origin/main`, open PRs, and this branch.

## NEEDS USER INPUT

- A safe disposable authenticated parity identity or approved non-production fixture path is still required for matched Android/web H07 screenshots. No production identity or fabricated Multiplayer data will be used.
