# SQC Mobile first-screen cockpit pass — 2026-05-09

## Trigger

Andreas sent a screenshot of the Android preview and asked for full SQC Mobile UI focus. The screenshot confirmed the review finding: brand direction is right, but the first screen was too hero/debug-heavy and pushed the real next action down.

## Shipped

App-only changes in `apps/mobile`:

- Tightened the hero into a compact website-style mobile header.
- Removed the prominent build/debug pill from the top hero and moved build identity into the lower parity/sync card.
- Changed the first action card into a clearer **Today’s Side Quest** cockpit.
- Added compact progress stats for coats/proofs directly inside the cockpit.
- Renamed the secondary CTA from `See reward` to clearer `View coat reward`.
- Added a simple first-screen flow strip: `1 Read → 2 Play → 3 Verify`.
- Moved website parity dock, first-run guidance, auth card, and Clerk readiness lower in the page so they do not crowd the first screen.
- Adjusted mobile tab labels toward website canon: `Side Quests`, `Mission`, `Coats`, `My SQC`, `Proof`.
- Bumped visible/runtime mobile identifiers:
  - `MOBILE_BUILD_LABEL`: `Android preview 0.2.13 / cockpit pass`
  - mobile package: `0.1.9`
  - Expo version: `0.1.11`
  - Android `versionCode`: `12`

## Verification

- `pnpm --dir apps/mobile typecheck` ✅
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-ui-cockpit` ✅
- `pnpm lint` ✅ with 3 pre-existing warnings:
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - `src/components/proof-image.tsx` `<img>` warning
  - `src/components/site-nav.tsx` `<img>` warning

## Notes

- No website feature changes were made.
- This pass intentionally avoids account mutation work until Clerk Native API/token acceptance is settled.
- A fresh EAS APK was not produced in this pass because previous checks showed shell EAS auth was unavailable; Android JS export verifies the current bundle compiles.
