# SQC logged-in homepage Proof loop removal — 2026-05-06

## User request

Andreas sent a logged-in homepage screenshot and asked to remove the `Proof loop` section. He clarified that the current cleanup requests apply to the logged-in homepage.

## Change

Updated `src/app/page.tsx` so the logged-in homepage no longer renders the `Proof loop` / `From bad idea to brag receipt.` panel, including its three step cards and `Run latest-game check` / `Open proof log` buttons.

The signed-out homepage explainer remains unchanged.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
