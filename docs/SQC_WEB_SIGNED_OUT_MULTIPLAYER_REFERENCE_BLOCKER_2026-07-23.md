# Signed-out Official Multiplayer reference blocker — 2026-07-23

## Reference and reconciliation

- Binding reference: installed shipped Android package `com.sidequestchess.app`, version `0.1.338`, versionCode `338`, APK SHA-256 `adfbecbc922bc75828539f5f21b70346ad8853a9de96a01109211ef42238e228`, on the Android 15 `sqc_verify_35` emulator at 1080×2400.
- Reachable runtime path: signed-out `TodayDashboard` → `Browse Multiplayer Side Quests` → `MultiplayerSideQuestsScreen` → Official catalog. The dormant Multiplayer implementations were not used.
- Matrix scope: screenshot item `M01`, signed-out populated Official tab only. Signed-in, empty, loading/error, joined/hosted/finished, Community, and mutation states remain separate.
- Fresh source reconciliation: `origin/main` is `4b383fe1a43614e8a83b38618b161445143aab1c`; open PR #84 is this lane, PR #27 is the source-only matrix, and PR #2 is stale/conflicted. No competing open or newly merged correction overlaps M01.
- Exact web candidate: PR #84 head `5bbb00234373781c2e6cc8c3378626201e2d6717`, immutable preview `https://cc-2q4sjrz1y-andreas-nordenadlers-projects.vercel.app`.
- Production is HTTP 200, but GitHub deployment history identifies production source `6ed6faa804771a477b8b619b0169f49837fa147d`, an earlier PR #84 head rather than `origin/main`. This cycle did not merge or promote anything.

## DONE

- Exercised the real shipped Android navigation and captured the signed-out Official Multiplayer catalog.
- Rechecked the exact preview’s signed-out `/multiplayer` route and the public mobile bootstrap contracts on both production and the immutable preview.
- Stopped fail-closed without changing web product code: the installed v338 screen is not showing its public bootstrap catalog. It displays the compiled `getDevTrackerPreviewAccount` review records (`Knights Before Coffee Rush`, `No Castle Club Night`, `Queenless Cup`, fabricated player counts and timers) even though the authentication bridge is signed out.
- The production and preview `/api/mobile/bootstrap` responses agree on the real public catalog: `Official 14-Day Starter Shield`, `Official 14-Day Royal Route`, and `Official 14-Day Chaos Ladder`, each with zero players and the current server-derived window. The exact web preview renders those truthful records.
- Per the parity program’s no-fabricated-users/quests/progress rule, the web was not changed to copy the Android review fixtures, and M01 was not marked visually or behaviorally complete.

## VERIFIED

- Android accessibility hierarchy after a fresh Home pull refresh still shows the three review rows, player counts `8`, `14`, and `5`, and timers `18h`, `2d`, and `4d`; each row’s like action correctly remains a sign-in path.
- Android screenshot: `/tmp/sqc-v338-m01-official-signedout.png`, 1080×2400, SHA-256 `7c653268172396543a904210ed3856fce2f404c8b24dedd7ead9cba896b2cf70`.
- Extracted installed bundle: `/tmp/sqc-v338.bundle`, SHA-256 `18e25fde4230f042d1e7e5772c7c11f54281e60fd532a3265c7eacab08a6940c`. The only source definitions for the displayed review rows are inside `getDevTrackerPreviewAccount`; normal signed-out runtime selection is otherwise `getSignedOutPublicMultiplayerCatalog(bootstrap)`.
- Production `/api/mobile/bootstrap`: HTTP 200 and current truthful three-row Official catalog.
- Exact-preview `/api/mobile/bootstrap`: HTTP 200 and the same current truthful three-row Official catalog.
- Exact preview `/multiplayer`: HTTP 200; title `Multiplayer Side Quests — Side Quest Chess`; three real Official rows; real Official/Community switch, close action, detail links, and sign-in like paths; no visibly broken assets, clipping, or overlap in the inspected desktop viewport.
- No fabricated account, quest, participant, progress, standing, or provider state was introduced. Repository was clean before this documentation-only record.

## NEXT

- Keep M01 open. Continue with the highest-value parity slice whose Android v338 reference state is truthful and reproducible, while treating any `getDevTrackerPreviewAccount`-derived screen as invalid data evidence.
- Separately, a future authorized Android release should remove `EXPO_PUBLIC_SQC_MOBILE_PREVIEW_AUTH=1` from production builds or otherwise make the preview-account path unreachable outside a development/review build. That is mobile release work and outside this web-only lane.

## NEEDS USER INPUT

- None for this bounded investigation. PR #84 remains draft and unmerged because its cumulative authenticated matched-state and Terms legal-adoption gates remain unresolved; M01 also remains open because the shipped v338 reference presents compiled review data in the signed-out catalog.
