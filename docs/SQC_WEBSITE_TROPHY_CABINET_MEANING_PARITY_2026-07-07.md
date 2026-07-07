# SQC Website Trophy Cabinet Meaning Parity - 2026-07-07

## Mobile Source

- Source inspected: `apps/mobile/App.tsx`.
- Matched surface: `CoatOfArmsScreen`.
- Mobile labels preserved:
  - `Trophy Cabinet`
  - `Every bad idea deserves a coat of arms.`
  - `Current live Side Quest Chess coats of arms`
  - `Live quest coat of arms meanings`
  - `Shield`
  - `Meaning`
  - `Side Quest`

## Website Slice

- Updated `/trophy-cabinet` / `/badges` to lead with the mobile Coat of Arms headline and signed-in/signed-out shelf copy.
- Added the mobile-style live Coat of Arms roster with locked labels and earned state.
- Added the missing `Live quest coat of arms meanings` section using each official Side Quest's `badgeIdentity.heraldry.shield`, `badgeIdentity.heraldry.meaning`, and Side Quest title.
- Preserved the existing unified reward shelf sections for Official Multiplayer podiums, unlocked Solo rewards, Custom rewards, community Multiplayer rewards, and proof boards.

## Verification

- `pnpm build` passed.
- Local screenshot captured from `http://localhost:3000/trophy-cabinet`:
  - `artifacts/sqc-trophy-cabinet-meaning-parity-2026-07-07/trophy-cabinet-mobile.png`
- Screenshot assertion:
  - First `h1`: `Every bad idea deserves a coat of arms.`
  - Found `Live quest coat of arms meanings`.
  - Found `Current live Side Quest Chess coats of arms`.
