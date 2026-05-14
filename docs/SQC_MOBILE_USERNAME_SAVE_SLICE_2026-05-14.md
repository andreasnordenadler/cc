# SQC Mobile Username Save Slice — 2026-05-14

## Context

Andreas asked for strong tempo on the SQC mobile app now that the website is launched and feature-frozen. This slice implements the first app-only safe mutation while preserving the website as the backend authority.

## What changed

### Backend

Added `PATCH /api/mobile/profile`:

- requires Clerk authentication via the existing mobile API auth path;
- accepts JSON `lichessUsername` and `chessComUsername`;
- validates usernames as public chess-site handles using letters, numbers, underscores, and hyphens only;
- requires at least one username;
- writes to Clerk `publicMetadata`, matching the website account/profile fields;
- returns previous and updated chess account state for mobile feedback.

Updated `src/proxy.ts` matcher from only `/api/mobile/account` to `/api/mobile/(.*)` so new mobile authenticated endpoints are covered by Clerk middleware.

### Mobile app

Updated `apps/mobile/App.tsx`:

- build label: `Android preview 0.2.16 / username save`;
- added a native `Connect chess usernames` editor on the signed-in account screen;
- app sends Clerk bearer token to `PATCH /api/mobile/profile`;
- successful save refreshes account mirror from `/api/mobile/account`;
- signed-out/local-disabled state clearly keeps mutation disabled and explains that Google sign-in is required.

Updated `apps/mobile/src/api/sqc.ts` and `apps/mobile/src/types/sqc.ts` with the mobile profile update client/response contract.

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck` — passed
- `pnpm lint` — passed with the same 3 known warnings
- `pnpm build` — passed; route list includes `/api/mobile/profile`
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-username-save` — passed

## Impact

This is the first native mobile account mutation. It is deliberately narrow: chess username connection only, no proof awarding or quest mutation yet. That gives the mobile app a real signed-in action while keeping the website/backend as source of truth.
