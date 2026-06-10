# SQC web home Trophy proof receipt links — 2026-06-10

Closed a small website home Trophy Cabinet parity gap versus mobile-v251: official Solo items in the signed-in home Trophy Cabinet lane now open their canonical public proof receipt path instead of only routing back to the quest detail page.

## Scope

- Kept the existing home Trophy Cabinet card, rows, coats, and navigation styling.
- For completed official Solo Side Quests, resolves the latest passed proof attempt and builds the same public `/proof/...` receipt path used by the account Trophy Cabinet.
- Falls back safely to preview-style proof paths when older completed records lack a stored passed attempt.
- Custom Solo and Multiplayer rows keep their existing account/table receipt destinations.

## Verification

- `pnpm lint -- src/app/page.tsx`
- `pnpm build`
- `pnpm deploy:prod` after `pnpm quest:release-gate`
- Production deploy: `https://cc-lz6yi4usg-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: production and deploy `/` returned 200, `/proof/preview-finish-any-game?homeProofReceiptLinksSmoke=20260610` returned 200 with proof/share-board content, and `/badges?homeProofReceiptLinksSmoke=20260610` returned 200 with Trophy Cabinet content.
