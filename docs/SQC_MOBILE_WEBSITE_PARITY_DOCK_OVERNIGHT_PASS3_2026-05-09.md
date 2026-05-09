# SQC mobile website parity dock — overnight pass 3 — 2026-05-09

## Shipped slice
- Added an Android-first **Website parity dock** near the top of the mobile shell.
- The dock mirrors core website GUI routes as safe mobile actions: quest deck, mission brief, checker, My Side Quests, scoreboard, and badges.
- Account-sensitive routes remain graceful when Clerk/backend auth is unavailable: signed-out and local-only states hand off to the canonical website instead of exposing dead native controls.
- Bumped the mobile build label to `Android preview 0.2.11 / overnight pass 3` and package version to `0.1.7`.

## Verification
- `pnpm --filter @sidequestchess/mobile typecheck` — passed.
- `pnpm --filter @sidequestchess/mobile exec expo export --platform android --output-dir dist-android` — passed.
- `pnpm lint` — passed with 3 pre-existing warnings only (`deploy-production-guard.mjs`, `proof-image.tsx`, `site-nav.tsx`).
- `pnpm --filter @sidequestchess/mobile build:android:alpha` — blocked before build by missing Expo/EAS authentication (`eas login` or `EXPO_TOKEN` required). No token was printed or stored.

## User-visible impact
Android testers now get a compact native route board that makes the app feel closer to the website while keeping risky account mutations website-owned until mobile Clerk/backend verification is fully ready.
