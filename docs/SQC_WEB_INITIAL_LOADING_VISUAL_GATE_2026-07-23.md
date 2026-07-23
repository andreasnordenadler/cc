# Web initial loading visual gate — 2026-07-23

## Reference and reconciliation

- Sole product reference: shipped Android v338 (`0.1.338`, versionCode `338`) on the Android 15 `sqc_verify_35` emulator at 1080×2400.
- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, Vercel production `dpl_3NQMTSfp6rQgB47oVHatjN6xPQrP` sourced from `origin/main`, the Android runtime dispatcher, and the July 13 exhaustive parity matrix.
- The loading implementation was already complete on PR #84 at `99a0c75835ae5f1a63ef60ffb1bfd92c7fa86426`. This bounded release-tail slice closes the outstanding public G01 matched-state visual evidence without changing product code.

## DONE

- Captured Android v338 from a cold application start during its real initial bootstrap.
- Exercised the exact PR-head preview through a real client-side route transition while delaying only the RSC response, which rendered the production `loading.tsx` boundary rather than a fixture.
- Verified the loading boundary at mobile and desktop widths, including its accessibility semantics and the final transition to Home.

## VERIFIED

- Android package: `com.sidequestchess.app`, version `0.1.338`, versionCode `338`.
- Android loading capture: `/tmp/sqc-v338-g01-01.png`, 1080×2400, SHA-256 `c0cdf2886141cedf4bc3cfeb0bb7e9993abefcc55a890d69af71736073558d90`.
- Exact preview: `https://cc-9sg73m7pe-andreas-nordenadlers-projects.vercel.app` at PR head `c0bea497414b19cc4141fb7c15369c3e1a21abf7`.
- Web mobile capture: `/tmp/sqc-web-g01-loading-mobile-c0bea497.png`, 390×844, SHA-256 `8c16ab76299c6489e74ea1c177ba0f9c911daf460697a5f8c42bd2c1d7a859dd`.
- Web desktop capture: `/tmp/sqc-web-g01-loading-desktop-c0bea497.png`, 1440×900, SHA-256 `51aa2dfd3fbd369d5b17e0652108fec4ea7aebae84d4056760dede3d60614399`.
- Both web widths rendered only the real `Loading the live quest board...` status with `aria-busy="true"`, no app navigation chrome, zero console/page errors, zero horizontal overflow, and zero serious/critical axe violations.
- Fresh matched visual inspection passed fail-closed: Android and web share the compact gold spinner, muted centered status copy, warm-to-black backdrop, faint full-height SQC watermark, and uncluttered hierarchy. No clipping, overlap, white-mask artifact, or material contrast defect was found.

## NEXT

- Continue with the highest-ranked still-open public parity state after fresh current-main/open-PR reconciliation. Authenticated matched-state items remain fail-closed until a safe disposable non-production identity is available.

## NEEDS USER INPUT

- None for G01. PR #84 remains draft because its cumulative authenticated visual gates and Terms legal-adoption blockers are unchanged.
