# SQC Mobile Coat Shelf Slice — 2026-05-14

## Context

Andreas confirmed that the SQC website is launched/frozen and that the next execution lane should be the mobile app version.

This slice continues the existing mobile roadmap item: **SQC Mobile UI Slice 2: first-class Coat of Arms surface**.

## What changed

Updated `apps/mobile/App.tsx` only; the frozen website UI was not changed.

Mobile `Coats` / proof surface now:

- leads with a larger coat-of-arms hero image instead of a generic proof preview;
- labels the surface as a **Coat of Arms reward**;
- uses badge unlock copy as the primary reward text;
- shows quest, rarity, motto, and charge facts;
- adds a `Heraldry file` section with shield, crest, meaning, and weirdness;
- adds a mobile coat shelf:
  - signed-out/public mode shows a locked selected-reward preview;
  - authenticated mode shows synced earned coats from account state, up to four recent rewards;
- keeps proof minting/account-sensitive actions as website handoffs until native account mutation is explicitly built.

## Build label

`Android preview 0.2.15 / coat shelf`

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck` — passed
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-coat-shelf` — passed
- `pnpm lint` — passed with the same 3 known warnings:
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - `src/components/proof-image.tsx` `<img>` warning
  - `src/components/site-nav.tsx` `<img>` warning

## Impact

The mobile app now treats coats of arms as a first-class reward/trophy surface, closer to the SQC website product identity, without adding any new frozen website feature.
