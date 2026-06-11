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
Pending production deploy and live smoke for `/connect`, `/challenges`, and `/groupquests/public`.
