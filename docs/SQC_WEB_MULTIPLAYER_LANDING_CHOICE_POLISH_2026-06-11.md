# SQC web Multiplayer landing choice polish — 2026-06-11

Sprint: `sqc-website-ux-parity-review-24h`

## User-facing change

- Upgraded `/groupquests` from a broad Multiplayer explainer into a clearer SQC table-entry hub.
- Replaced harsher/looser signed-out copy with player-facing table language: host, join, proof rules, and leaderboard trust.
- Added an SQC-styled `Choose your table` panel for public tables, private host-code tables, and hosting your own Multiplayer Side Quest.
- Polished the signed-in command-center copy so active tables, public runs, and finished proof receipts read as deliberate next steps instead of a flat list.
- Kept existing create/join/private-code/public-discovery routes and verifier behavior unchanged.

## Checks

- `pnpm lint -- src/app/groupquests/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Production

- Commit: `4d8580e` (`Polish Multiplayer landing choices`)
- Production deploy: `https://cc-mbufr0dx7-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Smoke

- `https://sidequestchess.com/groupquests?landingChoiceSmoke=20260611` → 200 with `Choose your table` and `Chess dares for a shared table`.
- `https://cc-mbufr0dx7-andreas-nordenadlers-projects.vercel.app/groupquests?landingChoiceSmoke=20260611` → 200 with the same landing-choice copy.
- `https://sidequestchess.com/groupquests/public?landingChoiceSmoke=20260611` → 200 Public Multiplayer content.
- `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?landingChoiceSmoke=20260611` → 200 seeded Multiplayer detail content.
