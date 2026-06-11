# SQC Web Public Multiplayer Discovery Polish — 2026-06-11

Sprint: SQC website UX parity review 24h

## What changed

- Polished `/groupquests/public` so public Multiplayer discovery feels closer to the app-quality Community Solo browse treatment.
- Replaced the loose filter row with an SQC-styled `Find a table` panel that explains search, status, sorting, proof-window inspection, and privacy boundaries.
- Turned each public table row into a clearer scan card with a visible `Rule preview` for provider, clock, and event window before click-through.
- Grouped inspect/join and host-browse links under a deliberate `Next step` panel so actions no longer feel piled onto the listing row.
- Preserved existing public/private visibility behavior, host filtering, official archive handling, and join/proof routes.

## Verification

- `pnpm lint -- src/app/groupquests/public/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Production

- Deployed production: `https://cc-pu9c9qape-andreas-nordenadlers-projects.vercel.app`
- Aliased to: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/groupquests/public?publicMultiPolishSmoke=20260611` → 200 with `Find a table`, `Rule preview`, and `Next step` content.
- `https://cc-pu9c9qape-andreas-nordenadlers-projects.vercel.app/groupquests/public?publicMultiPolishSmoke=20260611` → 200 with the same public discovery polish.
- `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?publicMultiPolishSmoke=20260611` → 200 with Multiplayer detail/proof-check content.
- Smoke bodies checked for old visible phrase families: no `website creator`, `website-first`, `web-first`, `mobile-style`, `account handoff`, `host context`, or `host shelf` matches.

## Commit

- `f92df82` — `Polish public Multiplayer discovery UX`
