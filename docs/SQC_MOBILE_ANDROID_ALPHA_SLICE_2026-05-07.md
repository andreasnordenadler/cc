# SQC Mobile Android Alpha Slice — 2026-05-07

## Goal

Move the Expo mobile app from a single catalog demo toward an Android-testable alpha shell while preserving the Side Quest Chess web launch candidate and the anti-drift rule.

## Shipped in this slice

### Android-first EAS config

Added root `eas.json` with internal Android APK-oriented profiles:

- `development` — development client, internal distribution, APK.
- `android-alpha` — Android-first internal alpha APK.
- `preview` — internal Android APK plus iOS simulator profile for later checks.
- `production` — store-ready profile placeholder with local versioning.

No store credentials, OAuth secrets, signing material, or app-store account steps were added.

### Expo app config hardening

Updated `apps/mobile/app.json` with:

- Android `versionCode: 1`;
- empty Android permissions list for least-privilege alpha posture;
- keyboard resize mode;
- app update fallback setting;
- unchanged package/bundle IDs: `com.sidequestchess.app`.

### App-side screen/state structure

Refactored `apps/mobile/App.tsx` from a single screen into a simple mobile shell with tabs for:

- Catalog;
- Quest detail;
- Account;
- Status;
- Proof.

The shell still consumes `GET /api/mobile/bootstrap` and renders the live web-backed quest catalog. Account/status/proof are intentional placeholders until authenticated mobile APIs are available.

## Alpha schedule notes

Recommended accelerated Android alpha order:

1. **Alpha shell** — EAS config + tabbed app structure + live catalog/detail from `/api/mobile/bootstrap`. Completed in this slice.
2. **Read-only account contract** — authenticated mobile endpoint for current user, linked chess handles, active quest, completed receipts.
3. **Action endpoints** — start quest, check latest game, reset/repeat quest from mobile.
4. **Proof viewer/share** — show backend-generated proof image and wire Android native share sheet.
5. **Internal APK** — run `pnpm --filter @sidequestchess/mobile build:android:alpha` once Expo/EAS auth and signing choices are ready.

## Verification target

- `pnpm --filter @sidequestchess/mobile typecheck`
- `pnpm lint`
- `pnpm build` only if web/backend code changes. This slice does not change web API/runtime behavior.
