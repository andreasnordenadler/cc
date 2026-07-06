# SQC website/mobile route alias parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and adds route-level aliases for mobile app screen names that did not have matching web URLs. Existing canonical routes stay unchanged.

## Parity matrix

| Mobile app surface | Native label/source | Website route | Status |
| --- | --- | --- | --- |
| Bottom tab | `Side Quests` | `/side-quests` alias to the Solo catalog | Added |
| Solo catalog | `Solo Side Quests` hamburger label | `/solo` and `/challenges` | Preserved |
| Bottom tab | `Trophy Cabinet` | `/trophy-cabinet` alias to Coat of Arms page | Preserved |
| Internal screen | `coatOfArms`, help topic `Coat of Arms` | `/coat-of-arms` alias to Trophy Cabinet | Added |

## Slice changes

- Added `src/app/side-quests/page.tsx` as a tiny App Router alias for the existing Solo Side Quest catalog.
- Added `src/app/coat-of-arms/page.tsx` as a tiny App Router alias for the existing Trophy Cabinet / Coat of Arms surface.
- Left mobile app code, canonical website navigation, proof flows, auth flows, APIs, and existing route implementations untouched.

## Proof

- Screenshots:
  - `artifacts/sqc-route-alias-parity-2026-07-06/side-quests-desktop.png`
  - `artifacts/sqc-route-alias-parity-2026-07-06/side-quests-mobile.png`
  - `artifacts/sqc-route-alias-parity-2026-07-06/coat-of-arms-desktop.png`
  - `artifacts/sqc-route-alias-parity-2026-07-06/coat-of-arms-mobile.png`
- Verification:
  - `pnpm lint -- src/app/side-quests/page.tsx src/app/coat-of-arms/page.tsx`
  - `pnpm exec tsc --noEmit --pretty false`
  - `pnpm --dir apps/mobile exec tsc --noEmit --pretty false`
  - `pnpm build`
