# Web offline official board parity — 2026-07-22

## Reference and reconciliation

- Reference: shipped Android v338 (`0.1.338`, versionCode `338`) offline bootstrap in `apps/mobile/src/data/offlineBootstrap.ts:202-217`. When live bootstrap fails, Android keeps a bundled official catalog available and offers retry; it does not invent account, likes, progress, or Multiplayer state.
- Existing audit: `FULL_WEB_ANDROID_PARITY_MATRIX_2026-07-13.md` on documentation PR #27, global offline row 35, ranked gap 22, and screenshot state G02.
- Fresh reconciliation: `origin/main` remains `4b383fe1a43614e8a83b38618b161445143aab1c`; open product PR #84 is this parity lane and PR #27 is documentation-only. The current web error boundary showed only retry, so the saved official browse capability remained absent and was not in flight elsewhere. Production is healthy at `https://sidequestchess.com` but remains on deployment SHA `6ed6faa804771a477b8b619b0169f49837fa147d`, behind both `origin/main` and this draft lane.

## DONE

- Preserved the truthful live-board failure alert and real Next.js `unstable_retry` action.
- Added a bounded six-row fallback sourced from the web app's canonical bundled official `CHALLENGES`; each row expands locally to its bundled instruction and complete rules without calling a live route.
- Explicitly states that live account, likes, progress, and Multiplayer are unavailable, so the fallback cannot be mistaken for live personalized state.
- Added one-column text-row geometry and overflow-safe wrapping for mobile and desktop.

## VERIFIED

- Strict vertical RED/GREEN: the route-failure test first failed because no saved official board existed, then passed after the fallback was wired; a reviewer caught that live detail links were not truly offline-safe, so an added test failed until each row exposed its complete bundled rules locally; the scoped geometry/disclosure assertions also failed before their CSS and then passed.
- Focused test: 2/2 pass.
- Temporary production-component preview (removed before final gates): HTTP 200 at 390×844 and 1440×900; six local disclosures; the first disclosure opened to the complete instruction/rule list; zero console/page errors, zero horizontal overflow, and zero serious/critical axe findings. Clean capture SHA-256: mobile expanded `5f98cb300f2d498abc098211e7f116f83550c522610773a12ca0c8f59862d02e`; desktop collapsed `d8edac81f36528d01e4e412f74fc106d3fa6ddac9580fa54ecdb080e5df6ac20`.

## NEXT

- Obtain a fresh Android v338 G02 offline-state capture at the same viewport and compare it with the clean web capture.
- After that matched-state gate, rerun exact-preview and exact-HEAD release gates before considering PR #84 for merge.

## NEEDS USER INPUT

- None for implementation. Release remains blocked because no Android emulator/AVD is currently available to produce the required fresh matched G02 capture. Existing PR #84 authenticated H07/H08 and Terms legal-adoption blockers also remain.
