# Community Solo detail inline-like parity — 2026-07-23

## Reference and reconciliation

- Sole product reference: shipped Android v338 (`com.sidequestchess.app`, version `0.1.338`, versionCode `338`) on the Android 15 `sqc_verify_35` emulator at 1080×2400.
- Reachable runtime path: signed-out Home → Browse Solo Side Quests → Community Side Quests → real public `Castle? Never Heard Of It` by Nora Skewer → detail. The runtime dispatcher uses `QuestBoardDashboard` and `CustomSideQuestDetailModal`; no dormant implementation or fabricated account/progress state was used.
- Compared state: the public signed-out portion of matrix item `C03`, scoped to the title/like action and preserved signed-out action stack. Signed-in non-owner, owner, active, completed, loading/error, and mutation-result states remain separate.
- Fresh reconciliation: `origin/main` is `4b383fe1a43614e8a83b38618b161445143aab1c`; open PR #84 is this lane, PR #27 is the stale source-only audit, and PR #2 is stale/conflicted. No current mainline or open-PR correction overlaps this detail primitive.
- Candidate preview: `https://cc-rodtgnmnl-andreas-nordenadlers-projects.vercel.app`, built from the final three-file product/test diff before commit. Production remains healthy on `origin/main` source `4b383fe1a43614e8a83b38618b161445143aab1c`; nothing was promoted.

## DONE

- Moved the real Community Solo like count/thumb into the title row, matching Android v338's reachable detail hierarchy.
- Reused the existing exact-resource shared like control, preserving server-derived identity, signed-in optimistic rollback/pending behavior, and the exact signed-out sign-in return path.
- Removed the duplicate lower like action while preserving pick/sign-in, report, creator shelf, share/copy, back, and signed-in Use in Multiplayer capabilities.

## VERIFIED

- Strict RED/GREEN: the rendered production-component test failed on the absent inline like control and duplicate lower action, then passed after the minimum shared-control reuse.
- Full suite: 424/424; lint: zero errors and four existing warnings; root and mobile typechecks: pass; production build: pass; `git diff --check`: pass.
- Independent review of the exact three-file product/test diff: PASS with no security or logic findings.
- Candidate preview public browser suite: 19/19 at desktop/mobile projects.
- Exact changed-state probe at 390×844 and 1440×900: HTTP 200, title and like pill share one clean row, exact encoded sign-in return, report handoff preserved, duplicate lower like action absent, no unexpected product mutation, unchanged storage/cookie counts, zero console/page errors, zero horizontal overflow, and zero serious/critical axe violations.
- Android capture: `/tmp/sqc-c03-community-detail-android.png`, 1080×2400, SHA-256 `21ed5b2924905d1ea7a4e866fe838c7b2b177e48a44fc041f4f4d7946dfbe85b`.
- Candidate preview captures: mobile `/tmp/sqc-c03-inline-like-mobile.png`, 390×1158, SHA-256 `035775df806e4bd1a31e464f0b54a9a2e53f50400e16f14c49164c9aca7ab3ae`; desktop `/tmp/sqc-c03-inline-like-desktop.png`, 1440×1138, SHA-256 `e1f172b5ce5f81f50723ab3c8d98d8da84963bc983caf9f17dc8bda8fe0bea95`.
- Fresh composed desktop inspection found no overlap, clipping, broken assets, white-mask defect, browser-default control regression, or material contrast/layout defect. Mobile geometry measured a 7px gap between the 286px title and 28px like pill inside the 390px viewport.
- The mutable public like aggregate was `1` in the Android capture and `0` in the later preview request; no count was fabricated or hard-coded, and this slice claims placement/action parity rather than simultaneous aggregate equality.

## NEXT

- Reconcile latest main/open PRs and continue with the highest-value still-open truthful Android-v338 state. Keep authenticated owner/participant/completed states and Terms adoption fail-closed until equivalent-state evidence or owner/legal input exists.

## NEEDS USER INPUT

- None for this bounded slice. PR #84 remains draft and unmerged because cumulative authenticated matched-state and Terms legal-adoption gates remain unresolved.
