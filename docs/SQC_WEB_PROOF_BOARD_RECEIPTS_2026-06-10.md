# SQC web proof-board receipts — 2026-06-10

Sprint: SQC website parity sprint (2026-06-09 17:35 → 2026-06-10 17:35 Europe/Stockholm)

## Shipped

- Wired the existing website chess-position proof board into official Side Quest proof surfaces.
- Completed official Side Quest detail pages now show the verified final position/last move when the verifier saved FEN/UCI evidence, while retaining the victory-scroll fallback for older receipts without board data.
- Active official Side Quest latest receipts now show a compact referee board when a failed or checked proof includes a saved final/break position.
- Public proof tokens now carry safe board evidence (`finalPositionFen`, `lastMoveUci`, `lastMoveSan`) for new proof links, and `/proof/[token]` renders the verified proof board when present.
- Existing proof links remain compatible; older tokens simply keep the scroll/image/share receipt without board data.

## Privacy / safety

- No raw account metadata, private user IDs, or custom rule configs are exposed.
- Board evidence is limited to verifier-produced chess position/move fields already stored in proof attempts.
- No production data changes were made.

## Verification

- `pnpm lint -- src/components/proof-position-board.tsx src/lib/proof-share.ts 'src/app/challenges/[id]/page.tsx' 'src/app/proof/[token]/page.tsx'`
- `pnpm build`
- Commit: `e530892` (`Add web proof board receipts`)
- Production deploy: `https://cc-qscm807mm-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: `/proof/preview-finish-any-game?proofBoardSmoke=20260610` returned 200 with `Proof board`, `SQC proof board`, `Verified position attached`, and highlighted chess squares; `/challenges/finish-any-game?proofBoardSmoke=20260610` returned 200; `/challenges?proofBoardSmoke=20260610` returned 200.
