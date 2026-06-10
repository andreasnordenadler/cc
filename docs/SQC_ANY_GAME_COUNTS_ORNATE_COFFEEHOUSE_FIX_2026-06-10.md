# SQC Any Game Counts Ornate Coffee House-Level Fix — 2026-06-10

## Trigger
Andreas rejected the previous `Any Game Counts` badge because it was still not detailed/decorated enough compared with the Coffee House / `Knights Before Coffee` coat of arms.

## Target
Use `public/badges/v6/knights-before-coffee-badge.png` as the detail/decoration quality bar:
- dense baroque gold filigree
- layered scrollwork and mantling
- jewels/stars/pendant details
- rich blue/gold heraldic depth
- no text/letters/numbers
- transparent outside background

## Fix
Replaced both mirrored assets:
- `public/badges/v6/proof-loop-test-badge.png`
- `apps/mobile/assets/badges/v6/proof-loop-test-badge.png`

The new asset uses a much denser ornate heraldic frame, shield subdivisions, chess pieces, a completed-game/check motif, jewels, ribbons, and layered decoration to better match the Coffee House coat quality.

## QC
- Visual comparison was run against the user-provided screenshot and `knights-before-coffee-badge.png`.
- Initial chroma mask had magenta artifacts and was rejected.
- Final cleanup removed magenta artifacts while preserving internal gold/blue ornament detail.
- Final strict QC: ship — more detailed/decorated, no visible magenta fringing, no damaged internal details, no readable text/letters/numbers.

## Transparency proof
Both web and mobile assets are `1024x1024 RGBA` PNGs with alpha extrema `(0, 255)`, sampled outside corners `[0, 0, 0, 0, 0, 0]`, and `49.27%` fully transparent pixels.

## Verification
- `pnpm build` passed after a transient stale/parallel Next build warning on first attempt.
- `pnpm quest:release-gate` passed.

## Deployment
Pending at time of doc creation.
