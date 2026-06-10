# SQC web Custom Solo proof-board receipts — 2026-06-10

Closed a small website proof-visual parity gap versus mobile-v251: Custom Solo proof receipts on `/account/custom-side-quests` now render the same safe chessboard evidence already used by official Solo proof receipts when verifier attempts include FEN/last-move diagnostics.

## Shipped

- Active/completed Custom Solo library cards keep the existing receipt summary and controls.
- When the latest Custom Solo attempt includes verifier board evidence, the card now shows the shared `ProofPositionBoard` receipt.
- Failed Custom Solo checks can show the safe referee-board fallback/explanation from failure diagnostics.
- Passed checks without board evidence keep the existing text receipt, avoiding fake boards.
- No raw custom quest config, private account metadata, invite codes, or destructive data changes are exposed.

## Verification

- `pnpm lint -- src/components/proof-position-board.tsx src/app/account/custom-side-quests/page.tsx`
- `pnpm build`
