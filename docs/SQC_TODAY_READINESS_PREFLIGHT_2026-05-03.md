# SQC Today Readiness Preflight — 2026-05-03

## Change
Added a dedicated `/today` readiness checklist that makes the daily Side Quest Chess loop explicit before testers leave the site:

1. Save public Lichess/Chess.com identity.
2. Play today’s exact quest rule in one eligible public game.
3. Return to Account/latest receipt to check pass/fail/pending.

The daily loop CTA now routes signed-in users to `/account` for latest-game checking instead of sending everyone to the generic result page.

## Why
Launch-readiness polish: the daily quest is a high-intent entry point, so it should reduce route hunting and make the verification loop obvious without adding more beta-tester/admin functionality.

## Verification
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm build`
- Live smoke: `https://cc-oaepqesku-andreas-nordenadlers-projects.vercel.app/today` returned 200 and contained `Today readiness`, `Do these three things before the receipt`, `latest-game loop`, `Save identity`, and `Run the receipt`.
- Live smoke: `https://sidequestchess.com/today` returned 200 and contained `Today readiness`, `Do these three things before the receipt`, and `latest-game loop`.
- Live smoke: `https://sidequestchess.com/account` returned 200.
- Vercel 500 scan: `node /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs --project cc --since 10m` returned `ok: true`, `total: 0`.

## Deployment
- Commit: this proof-doc commit (`Add today quest readiness preflight`)
- Production deploy: `https://cc-oaepqesku-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
