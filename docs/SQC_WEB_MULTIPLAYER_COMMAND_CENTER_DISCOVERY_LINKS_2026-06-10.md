# SQC Web Multiplayer Command Center Discovery Links — 2026-06-10

Closed a small Multiplayer command-center parity gap versus mobile-v251: signed-in mobile keeps the Multiplayer proof-ledger reminder visible and offers direct public discovery/history flows, while signed-in website `/groupquests` only showed the reminder to signed-out visitors and listed a small public preview without direct filter handoffs.

## Shipped

- Added the `Proof rule` card to signed-in `/groupquests`, matching mobile's reminder that Solo proof and Multiplayer proof are separate ledgers.
- Added direct command-center handoffs to `/groupquests/public`, `/groupquests/public?status=joined`, and `/groupquests/public?status=hosted` from the signed-in Public Multiplayer lane.
- Preserved existing website styling and privacy boundaries: private invite-only tables, invite codes, emails, participant metadata, and raw custom configs remain hidden.

## Verification

- `pnpm lint -- src/app/groupquests/page.tsx`
- `pnpm build`
- Commit: `30e5d56`
- Production deploy: `https://cc-ciov64ez6-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: 200 for `/groupquests?commandCenterLinksSmoke=20260610` with Multiplayer/Public/Proof rule content; 200 for production and deploy `/groupquests/public?commandCenterLinksSmoke=20260610`
