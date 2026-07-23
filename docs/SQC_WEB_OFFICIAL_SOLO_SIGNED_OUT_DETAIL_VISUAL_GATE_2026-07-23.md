# Web Official Solo signed-out detail visual gate — 2026-07-23

## Reference and reconciliation

- Sole reference: shipped Android v338 (`com.sidequestchess.app`, version `0.1.338`, versionCode `338`) on the Android 15 `sqc_verify_35` emulator at 1080×2400.
- Reachable runtime path: signed-out Home → Browse Solo Side Quests → Official Side Quests → Pawn-Only Picnic. The runtime dispatcher sends `sideQuests` to `QuestBoardDashboard`; no dormant implementation or fabricated account/progress data was used.
- Compared state: screenshot manifest item `S03`, available Official Solo detail while signed out. Signed-in available, active, completed, loading/error, and post-mutation states remain separate.
- Fresh reconciliation: `origin/main` is `4b383fe1a43614e8a83b38618b161445143aab1c`; open PR #84 is this lane, PR #27 is the stale source-only matrix, and PR #2 is stale/conflicted. No newer mainline or open-PR correction overlaps this state.
- Exact preview: `https://cc-bhgrwpolw-andreas-nordenadlers-projects.vercel.app`, source `fe49ff51fd3c35711f8a29affffcb3ad312b0d0a`. Production is healthy but remains on earlier PR #84 source `6ed6faa804771a477b8b619b0169f49837fa147d`.

## DONE

- Exercised the real Android v338 signed-out navigation to Pawn-Only Picnic and compared the exact same quest on the immutable web preview.
- Confirmed equivalent quest identity, objective, Easy/Coat state, crest, flavor, five ordered conditions, opening hint, public sharing, close/back behavior, and signed-out start boundary.
- Preserved browser capability: web adds a real copy-link fallback beside Web Share and a direct sign-in return path; it does not copy native-only pull, gesture, or hardware-back affordances.
- No product-code change was justified. The current exact preview already presents a faithful compact detail with truthful signed-out actions, so this bounded slice closes stale visual evidence rather than adding a token redesign.

## VERIFIED

- Android capture: `/tmp/sqc-s03-android.png`, 1080×2400, SHA-256 `67750d09124e239d2c8d5c785861ae434693d1a30cd6e943ad9c5a5bbf01b940`; its accessibility hierarchy records the exact five conditions, coat/difficulty, public share, and close action.
- Exact-preview mobile capture: `/tmp/sqc-s03-preview-mobile.png`, 390×844 CSS viewport, SHA-256 `96996da1793ea602ab007376042e2b9b7c4f10cc71d7f7b8526de1c09187f844`.
- Exact-preview desktop capture: `/tmp/sqc-s03-preview-desktop.png`, 1440×900 CSS viewport, SHA-256 `889fa0932b2afd399f1055a3518d7faa10bc58c8920974a290a917cc2488a244`.
- Both preview widths returned HTTP 200 with the exact title and five conditions, real Share/Copy/Sign in controls, one `main`, one `h1`, no zero-size visible controls, zero console/page errors, and `scrollWidth === viewportWidth`.
- Mobile detail card measured `370px` wide at `x=10` inside the 390px viewport. Desktop visual inspection found no clipping, overlap, broken crest/glow, malformed controls, unreadable copy, or misleading native-only instruction.

## NEXT

- Continue with the highest-ranked still-open equivalent-state visual/behavior gate after fresh main/open-PR reconciliation. Keep signed-in S03 active/completed states and authenticated Home/Multiplayer states fail-closed until a safe disposable identity exists.

## NEEDS USER INPUT

- None for this visual gate. PR #84 remains draft and unmerged because its cumulative authenticated matched-state and Terms legal-adoption blockers are unchanged.
