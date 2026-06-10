# SQC Web Failure Referee Board Receipts — 2026-06-10

Closed a website proof-visual parity gap versus mobile-v251: failed latest-game Solo proof receipts now use verifier failure diagnostics to show the same referee-board context as the app.

## Shipped

- Active official Side Quest receipt boards now fall back to `failureDiagnostic.fenAtBreak` and breaker UCI/SAN when the latest proof check fails.
- Failed receipts label the board as an SQC referee board, highlight the breaker move squares, and show the safe verifier explanation instead of only the generic receipt summary.
- When a failed receipt has no usable FEN, the website shows a neutral unavailable board panel with the safe failure reason rather than pretending a victory scroll exists.
- Completed proof boards and public proof links keep their existing victory-board/scroll behavior.

## Verification

- `pnpm lint -- src/components/proof-position-board.tsx`
- `pnpm build`
- Commit `429066c` pushed to `main`.
- Production deploy `https://cc-acgr5b089-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke returned 200/content for production and deploy `/challenges/finish-any-game?failureBoardSmoke=20260610` plus production `/proof/preview-finish-any-game?failureBoardSmoke=20260610`.
