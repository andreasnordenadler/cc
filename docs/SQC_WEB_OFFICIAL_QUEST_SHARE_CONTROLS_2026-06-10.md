# SQC Web Official Quest Share Controls — 2026-06-10

Closed a website/mobile parity gap where mobile-v251 official Solo detail cards had an explicit `Share public link` action, while website official Side Quest detail pages only exposed proof sharing after completion.

## Shipped

- Official website Side Quest detail pages now include a public `Share link` card for every visitor/state, using the existing social/copy control pattern.
- The share copy points at the canonical `/challenges/[id]` quest URL and uses public quest language, not completed-proof language.
- Shared social helpers now accept a custom social title and aria label, so Community/Custom public quest sharing no longer inherits proof-completion social titles.
- Completed proof receipt sharing keeps the existing proof wording, image copy/download controls, and receipt behavior.

## Verification

- `pnpm lint -- src/components/share-proof-actions.tsx 'src/app/challenges/[id]/page.tsx' 'src/app/challenges/community/[id]/page.tsx' src/app/account/custom-side-quests/page.tsx`
- `pnpm build`
- Commit `b5ab737` pushed to `main`.
- Production deploy `https://cc-1q37rgqpp-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke returned 200/share content for production and deploy `/challenges/finish-any-game?officialShareSmoke=20260610` plus production Community detail.
