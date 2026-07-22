# Web offline Home parity — 2026-07-23

## Reference and reconciliation

- Sole reference: shipped Android v338 (`0.1.338`, versionCode `338`) running on the Android 15 `sqc_verify_35` emulator at 1080×2400. Fresh airplane-mode capture: `/tmp/sqc-v338-offline-g02.png`, SHA-256 `551f8dd133638911cf637aaecbb91a3d1972dc16f10da6f6e07dd52ccaa468aa`.
- Reconciled `origin/main` at `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, the July 13 exhaustive audit G02 state, Android runtime dispatch, and the earlier fallback-board slice. No competing mainline or open-PR fix existed.
- Fresh evidence exposed one material mismatch in the earlier web fallback: Android first keeps the compact offline notice above its normal signed-out Home and reveals the saved Solo board only after the browse action; web replaced Home with a large error card and immediately expanded catalog.

## DONE

- Matched Android v338's compact `OFFLINE SIDE QUEST BOARD` notice and normal signed-out Home hierarchy.
- Kept the required web retry as a compact target-platform action without displacing the reference hierarchy.
- Made `Browse Solo Side Quests` open the six bundled official rows locally, with complete local rule disclosures and a real return action.
- Kept Multiplayer and sign-in honest while offline: they show local connection guidance and perform no navigation, account mutation, or fabricated live-data load.
- Preserved the normal online `GuestHome` links and every signed-in, loading, catalog, detail, modal, and error-independent shell state.

## VERIFIED

- Strict RED/GREEN: the focused test failed against the large immediate-catalog error surface and missing local-view reducer, then passed after the minimum offline-state implementation. An independent review then found browser-default button chrome and stale guidance after Back; both received new failing regressions before the scoped fixes.
- Focused test: 4/4 pass.
- Fresh matched visual evidence: Android v338 offline Home and web 390×844 offline Home share notice → crest → sign-in context → Solo/Multiplayer/sign-in action hierarchy, with no clipping or overlap. Web initial capture SHA-256: `a5268f89b9900656ed9da543c356e95f5b7584ee0c22b5c9349bf9d94aeb85e4`.
- Local production-component interaction at 390×844 and 1440×900: HTTP 200, zero console/page errors, zero horizontal overflow, zero action-triggered mutating requests after initialization, six local rows, and complete first-row disclosure. Expanded mobile capture SHA-256: `92cb24c0204fe7ca95c0d12650a53e7d50854557ddbed5a5e24437fcbd2020ed`.
- The temporary preview route was removed before the final repository gates.

## NEXT

- Continue with the highest-ranked still-open parity state after current-main/open-PR reconciliation. Authenticated matched-state items remain fail-closed until a safe disposable identity exists.

## NEEDS USER INPUT

- None for this implementation. PR #84 remains a draft because its cumulative authenticated visual and Terms adoption blockers are outside this slice.
