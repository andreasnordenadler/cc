# SQC web Privacy account-deletion accuracy — 2026-07-23

## Reference and reconciliation

- Sole client reference: shipped Android v338 (`com.sidequestchess.app`, version `0.1.338`, versionCode `338`) on the Android 15 emulator at 1080×2400.
- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, the Android runtime dispatcher, and the July 13 exhaustive screen/state/action matrix before selection.
- Reachable Android path: signed-out Community Multiplayer detail → Report Side Quest → Help & Support → Privacy Policy. Android opens the canonical `/privacy` route in a Chrome custom tab; no fabricated account, quest, progress, standing, or provider data was used as parity evidence.
- The shipped web Privacy draft contradicted both reachable v338 Account deletion and the current web Account control by claiming neither client exposed self-service account deletion.

## DONE

- Replaced the stale absence claim with the implemented deletion contract: signed-in users can permanently delete from My Account on web or mobile; Clerk identity and account-attached profile/progress are removed; replicated hosted/participant Multiplayer references are cleaned first; cleanup failure stops identity deletion and returns a retryable error.
- Clarified that at least one public chess username is required only while retaining the account; deleting the account removes the account profile.
- Kept unresolved backup/log retention and legal exceptions explicitly marked as launch-adoption blockers. This remains a launch draft, not adopted legal text.
- Corrected the Privacy hero’s pre-existing merged back-link/brand labels after the exact-preview visual gate caught them. The final layout preserves a measured 28px gap at mobile and desktop widths.

## VERIFIED

- Strict vertical TDD: the account-deletion disclosure test failed on the stale absence claim, then passed after the factual correction; a second visual regression test failed on the missing block layout, then passed after the one-rule CSS fix.
- Production contracts reviewed: web and mobile deletion controls, session/bearer-derived deletion routes, replicated Multiplayer cleanup with rollback, and fail-closed identity deletion.
- Full repository suite: 415/415 passing. Lint: 0 errors and 4 existing warnings. Root and mobile typechecks pass. Next.js production build passes. `git diff --check` and secret/unsafe scans pass.
- Fresh independent reviews passed for both the factual change and the visual remediation; neither found a security, logic, privacy, or blast-radius blocker.
- Exact final preview for `10f1d0caf9d6174e9046b907e2ac9a549dca5ae6`: `https://cc-pr39t9a3p-andreas-nordenadlers-projects.vercel.app` (Vercel Ready).
- Exact-preview public browser suite: 19/19 desktop/mobile checks.
- Exact-preview `/privacy` at 390×844 and 1440×900: HTTP 200; exact updated disclosure; zero stale absence claims; zero console/page errors; zero horizontal overflow; zero serious/critical axe violations; 28px back-link/kicker separation.
- Final screenshots: mobile `/tmp/sqc-privacy-mobile-10f1d0ca.png`, SHA-256 `2ca638d643f1c9d319badbb802856d98ec7297e4e642be09821c21df0ccc15c2`; desktop `/tmp/sqc-privacy-desktop-10f1d0ca.png`, SHA-256 `f52bb4e7817303d4bc5adf8d0a19180b3f73501f5b3f413eed892d5965b9ad3b`.
- Android canonical Privacy custom-tab capture: `/tmp/sqc-v338-privacy-2.png`, SHA-256 `521dbdcbc47f7fbabc4206c5f1110752fc7edbdec2936438f4817ca1a2dbd4be`. It proves the shipped reachable destination and unchanged visual shell; the corrected disclosure is intentionally newer implementation truth on the same route.

## NEXT

- Reconcile the latest mainline and continue with the highest-value still-open Android-v338 parity state that has truthful, reproducible runtime evidence. Keep fixture-backed signed-out Multiplayer screens invalid as data evidence.

## NEEDS USER INPUT

- PR #84 must remain draft: final legal adoption still requires owner/legal decisions on entity/controller identity and address, age/parental-consent policy, processing countries/transfers and vendor roles, sale/sharing position, backup/log retention and legal exceptions, governing law/disputes, notice/effective date, and existing-user treatment.
- Cumulative authenticated matched-state visual gates still require a safe disposable non-production browser identity/session; production identities and fabricated users will not be used.
