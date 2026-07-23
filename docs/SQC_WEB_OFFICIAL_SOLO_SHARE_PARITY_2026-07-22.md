# Official Solo sharing parity — 2026-07-22

## Reference and reconciliation

- Reference: Android v338 (`0.1.338`, source commit `39e293a4bb952acb1a4f61c113623810d751ef4f`), reachable `SelectedQuestDetailCard` sharing implementation in `apps/mobile/App.tsx` lines 8493-8503 and rendered control/status at lines 8566-8569.
- Reference behavior: **Share public link** opens platform sharing for the exact Official Solo detail URL and reports a safe result.
- Web evidence before this slice: `/challenges/[id]` rendered a current-page link labelled **Share public link**. It navigated nowhere and made no share or copy capability available.
- Reconciled against `origin/main` at `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #2, #27, and #84, and current branch HEAD before implementation. No newer branch or PR fixed this action.
- The 2026-07-13 audit row for Community sharing is stale (already fixed), but its separate Official Solo share finding remained present.

## Affected screen/state/action matrix

| Screen/state | Before | After | Evidence |
| --- | --- | --- | --- |
| Official Solo detail, signed out, available | Self-link | Native Web Share plus exact copy-link fallback; sign-in boundary preserved | Production component test and exact-preview desktop/mobile browser interaction |
| Official Solo detail, signed in, available | Self-link | Same share/copy capability; no identity included | Pure payload contract and route wiring test |
| Official Solo detail, completed but not active | Self-link | Same share/copy capability | Same production route branch and component contract |
| Official Solo detail, active pending/failed/passed | No change | Existing proof/start/check/management surfaces preserved | Blast-radius review and full suite |
| Share cancelled/error/unavailable | No truthful action state | Safe fixed status; browser/provider details are not exposed | Pure outcome tests |

## DONE

- Replaced the no-op current-page link with accessible Share and Copy buttons.
- The shared payload contains only the public title, fixed product copy, and exact encoded quest route. It contains no account, provider, username, email, or progress data.
- Preserved every existing Solo start/check/exact-proof/like/deactivate and sign-in path.

## VERIFIED

- Strict vertical RED → GREEN cycles for native sharing, copy fallback, safe failures, rendered controls, and route wiring.
- `pnpm test`: 384/384.
- `pnpm lint`: 0 errors; 4 pre-existing warnings.
- Root and mobile TypeScript checks: pass.
- `pnpm build`: pass.
- `git diff --check` and unsafe-pattern scan: pass.
- Independent pre-commit review of the production implementation and unit-test envelope: PASS.
- Exact preview for commit `758e9516ecf47e9cb1fe09d639decb4fe64e2d12`: Ready; CI and Vercel checks passed.
- Exact-preview browser suite: 19/19 across desktop and mobile.
- A temporary Playwright probe recorded fresh 1440×900 and 390×844 preview audits: HTTP 200, two visible controls, zero horizontal overflow, zero console/page errors, and zero serious/critical axe violations. The exact probe and screenshots are preserved locally under `artifacts/web-app-parity-v338-official-share-2026-07-22/`; desktop screenshot SHA-256 `c5cbadf5774e7bba39142002f28d9d87cc81b391d3e23f7bfea7342f7c2ca85d`, mobile screenshot SHA-256 `e3fd090cb518f3c3612d739da7bc909e52b8b787ab2b42a8d07580c886a75bc5`.

## NEXT

- Capture the same reachable Android v338 Official Solo detail at the 390×844-equivalent viewport and compare the live button geometry against the saved preview capture before releasing this draft PR.

## NEEDS USER INPUT

- A runnable Android v338 emulator/device capture is unavailable in this worktree environment (`adb` reports no device and no emulator binary is installed). The slice therefore remains unmerged and un-deployed under the matched-reference visual gate.
- PR #84 also retains its pre-existing authenticated Custom Side Quest screenshot gate and unresolved Terms adoption/legal decisions.
