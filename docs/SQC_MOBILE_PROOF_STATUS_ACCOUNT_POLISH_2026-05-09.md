# SQC Mobile Proof/Status/Account Polish — 2026-05-09

## Scope

Implemented one Android-safe mobile polish slice in `apps/mobile` without requiring Clerk Native API changes.

## User-visible changes

- Bumped the mobile build label to `Android preview 0.2.8 / polish pass 9`.
- Added explicit account-state clarity cards so testers can distinguish:
  - public catalog mode,
  - native Clerk bridge availability,
  - backend account mirror acceptance/rejection.
- Added status confidence cards for preview, active, and completed quest states.
- Added native Android share/link handoff cards on quest detail and proof screens.
- Hardened external website handoffs with guarded `Linking.openURL` fallback alerts instead of unhandled failures.
- Kept all account mutation and canonical proof generation on the website while improving mobile UX around proof/status/account states.

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck` — passed.
- `pnpm --filter @sidequestchess/mobile exec expo export --platform android --output-dir dist-android` — passed.
- `pnpm lint` — passed with 3 pre-existing warnings:
  - `scripts/deploy-production-guard.mjs` unused `envOutput` warning.
  - `<img>` warnings in `src/components/proof-image.tsx` and `src/components/site-nav.tsx`.

## APK build status

Fresh EAS Android alpha build was not started in this environment because `EAS_TOKEN` is not present and `eas whoami` reports `Not logged in`. No secrets were printed.
