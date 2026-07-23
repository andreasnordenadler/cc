# Signed-out Home navigation parity — 2026-07-22

## DONE

- Reconciled `origin/main` (`4b383fe1a43614e8a83b38618b161445143aab1c`), open PRs, production, the Android v338 dispatcher, and parity audit PR #27.
- Removed the web-only Guest menu panel from the signed-out Home only, matching the shipped Android v338 Home hierarchy.
- Preserved the three Android Home actions: browse Solo, browse Multiplayer, and choose sign-in method.
- Preserved signed-out Support, Privacy, and account navigation on non-Home routes; loading, not-found, signed-in, modal, and immersive shells are unchanged.

## VERIFIED

- Android reference: immutable v338 APK `0.1.338` / versionCode `338`, SHA-256 `adfbecbc922bc75828539f5f21b70346ad8853a9de96a01109211ef42238e228`, launched on Android 15 AVD `sqc_verify_35` at 1080×2400.
- Fresh Android signed-out Home capture: `/tmp/sqc-v338-home-fresh.png`.
- Strict TDD: the Home regression failed on the extra `Guest menu`, then passed after the narrowly scoped change; a reviewer-found loading/not-found blast-radius defect was reproduced with a new failing test and fixed.
- Focused tests cover Home actions, non-Home Support/Privacy reachability, loading/not-found, signed-in, modal, and immersive combinations.
- Full repository, preview, browser, and fresh final-review gates are recorded in the PR/release evidence rather than duplicated here.

## NEXT

- Continue with the highest-ranked still-open Android v338 state after reconciling current main and PR #84.

## NEEDS USER INPUT

- None for this slice.
