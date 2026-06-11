# SQC Web Connect Proof Source Polish — 2026-06-11

## Scope
Continued the SQC website UX parity sprint with the account-readiness/proof-source setup surface at `/connect`.

## Changes
- Reframed the page from an “activation key” step into a player-facing `Proof source` setup room.
- Added an SQC-styled `Ready to run` panel showing saved Lichess/Chess.com proof sources.
- Added a compact setup checklist for choose source → start a run → check proof, with signed-out guidance using the same card language.
- Preserved existing username save behavior and public Lichess/Chess.com verifier paths.

## Checks
- `pnpm lint -- src/app/connect/page.tsx`
- `pnpm build`

## Deployment / smoke
`pnpm deploy:prod` including `pnpm quest:release-gate`; production deploy `https://cc-3l8l5u9i4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke returned 200 for production/deploy `/connect?connectProofSourceSmoke=20260611` with `Proof source` setup copy, 200 Solo discovery content, and 200 Public Multiplayer content.
