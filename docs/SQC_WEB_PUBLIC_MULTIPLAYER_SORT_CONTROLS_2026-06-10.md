# SQC web Public Multiplayer sort controls — 2026-06-10

Closed a small Public Multiplayer discovery parity gap versus mobile-v251: website `/groupquests/public` now has explicit sort controls alongside the existing search/status/host filters.

## Shipped

- Added `Sort: closing soon`, `Sort: newest`, and `Sort: most players` controls to the public Multiplayer discovery form.
- Applied sorting server-side before official/community lanes render.
- Kept open tables before finished tables for the default closing-soon view, while finished/archive views sort recent finals first.
- Preserved signed-in `Joined by me` / `Hosted by me` filters, host shelves, private invite hiding, and existing website visual treatment.

## Verification

- `pnpm lint -- src/app/groupquests/public/page.tsx`
- `pnpm build`
- Production deploy: `https://cc-h202vqmvj-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: production `/groupquests/public?sort=players&publicSortSmoke=20260610` returned sort/discovery content; deploy `/groupquests/public?sort=newest&publicSortSmoke=20260610` returned sort/discovery content.

## Safety

No data mutations, no new public table exposure, no invite codes, participant emails, private account metadata, or raw custom configs are exposed.
