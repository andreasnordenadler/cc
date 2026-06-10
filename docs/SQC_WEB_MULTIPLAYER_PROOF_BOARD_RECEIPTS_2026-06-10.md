# SQC Web Multiplayer Proof Board Receipts — 2026-06-10

Closed a website parity gap left after official proof boards shipped: Multiplayer proof refreshes now carry verifier board evidence into the website receipt UI and account proof ledger.

## Shipped

- `/api/groupquests/[id]/refresh` now returns safe `finalPositionFen`, `lastMoveUci`, and `lastMoveSan` evidence per refreshed quest when the verifier supplies it.
- Passed Multiplayer checks merged into account proof history now keep the same board fields, so Trophy Cabinet/proof-history surfaces can reuse the evidence later.
- Joined `/groupquests/[id]` proof controls render a compact `Proof board` inside each refreshed quest receipt, highlighting the last move and preserving the existing Multiplayer card styling.
- Custom Multiplayer lineup checks inherit the same board path because they already use the Custom Solo verifier snapshot fields.

## Safety / privacy

- No raw custom config, private table metadata, participant emails, or account-private fields are exposed.
- Board evidence is limited to verifier-safe FEN/last-move fields already used by official Solo proof receipts.
- Existing tables without board evidence keep their previous text-only receipt cards.

## Verification

- `pnpm lint -- src/lib/groupquest-proof.ts 'src/app/api/groupquests/[id]/refresh/route.ts' src/components/group-quest-proof-controls.tsx`
- `pnpm build`
- Commit: `1488eaf` (`Add web Multiplayer proof boards`)
- Production deploy: `https://cc-laxh24u8i-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: 200 for `/groupquests/seed-public-sqcseed11-11?multiBoardSmoke=20260610`, 200 for `/groupquests/public?multiBoardSmoke=20260610`, and 401 `sign_in_required` for signed-out `POST /api/groupquests/seed-public-sqcseed11-11/refresh`
