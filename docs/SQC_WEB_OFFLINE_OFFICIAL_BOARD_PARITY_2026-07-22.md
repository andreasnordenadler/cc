# Web offline official board parity — 2026-07-23

## Reference and reconciliation

- Sole reference: shipped Android v338 (`0.1.338`, versionCode `338`) installed on the Android 15 emulator at 1080×2400. APK release SHA-256 remains `adfbecbc922bc75828539f5f21b70346ad8853a9de96a01109211ef42238e228`.
- Fresh runtime evidence replaced the earlier source-only assumption. With airplane mode enabled and the app cold-launched, Android opens its compact offline Home, then `Browse Solo Side Quests` reveals exactly five bundled Official rows: `finish-any-game`, `knights-before-coffee`, `bishop-field-trip`, `queen-never-heard-of-her`, and `knightmare-mode`.
- Runtime dispatcher/source contract: `apps/mobile/App.tsx` renders `OFFLINE_MOBILE_BOOTSTRAP`; `apps/mobile/src/data/offlineBootstrap.ts` contains those exact five IDs. The earlier web implementation used `CHALLENGES.slice(0, 6)`, so it exposed one non-reference row and was stale despite the prior visual proof.
- Fresh selection reconciliation: `origin/main` is still `4b383fe1a43614e8a83b38618b161445143aab1c`; open product PR #84 is this lane, PR #27 is documentation-only, and PR #2 is stale/conflicted. No competing mainline or open-PR correction exists. Production remains healthy but behind this draft lane.

## DONE

- Replaced positional `slice(0, 6)` selection with Android-v338-ID selection over the canonical web challenge records.
- The web offline board now exposes the exact five Android v338 bundled quest identities in the exact reference order.
- Preserved the target-platform retry, local return action, complete bundled rule disclosures, and truthful warning that account, likes, progress, and Multiplayer are unavailable.
- Left online catalogs, signed-in data, routes, and mutations unchanged.

## VERIFIED

- Strict RED/GREEN: the focused regression first failed because `getSavedOfficialChallenges` did not exist and the web still selected six positional rows; the minimal ID-backed selector then made all 4 focused offline tests pass.
- Fresh Android runtime captures: offline Home `/tmp/sqc-v338-offline-home-fresh.png`, SHA-256 `0f0cdf0165f1cb9ab7a67e742b5d2342d72b88c176db972090e0451c2a2134ee`; offline Official catalog `/tmp/sqc-v338-offline-solo-fresh.png`, SHA-256 `abacb4d2b8db038a3e390ce257d84d534baa3892149671935b6bb2c78c7f20ff`.
- Temporary production-component preview at 390×844 and 1440×900 rendered the exact five titles, returned HTTP 200, logged zero console/page errors, and had zero horizontal overflow. Capture hashes: mobile `19a5ed9501393c490b81b1c5c47e4aed404f4d3c1d8d70d4bb7301182b6b2ac0`; desktop `e99bc91a7d25b9f9e01f531691a70d457aafcf98ea0ca5cb4fad586591a8d9ea`.
- Fresh fail-closed inspection of the 390×844 changed state found all five rows and retry/return actions visible with no clipping, overlap, broken glyph, unreadable contrast, or horizontal overflow.
- The temporary preview route was removed before final repository gates.

## NEXT

- Continue with the highest-ranked still-open parity state after current-main/open-PR reconciliation. Authenticated matched-state items remain fail-closed until a safe disposable identity exists.

## NEEDS USER INPUT

- None for this slice. PR #84 remains draft because its cumulative authenticated matched-state and Terms legal-adoption blockers are outside this correction.
