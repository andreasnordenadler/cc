# SQC Web Home Trophy Cabinet Lane — 2026-06-10

Closed a small website home parity gap versus mobile-v251: the mobile home screen shows a Trophy Cabinet lane with recently unlocked Solo coats and Multiplayer podium scrolls, while the website home only linked to the full Coat of Arms roster.

Website `/` now adds a signed-in `Trophy Cabinet` summary card using existing mission/room-row styling. It surfaces the latest five safe Trophy Cabinet items across official Solo coats, completed Custom Solo recipes, and top-three Multiplayer podium scrolls, with direct receipt/account links and no private emails, raw custom configs, invite codes, or participant metadata.

Verification:

- `pnpm lint -- src/app/page.tsx`
- `pnpm build`

Deployment/smoke:

- Commit: `8173683`
- Production deploy: `https://cc-6f1d1jj0c-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: 200 for production and deploy `/` with SQC home content; 200 for `/badges?homeTrophySmoke=20260610` with Trophy Cabinet content.
