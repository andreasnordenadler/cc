# SQC Mobile Quest Actions Slice — 2026-05-14

## Context

Andreas asked Sam to make sure the SQC mobile app has feature parity with the website. I created `docs/SQC_MOBILE_FEATURE_PARITY_MATRIX_2026-05-14.md` and used it to prioritize the biggest gap: the mobile app could browse/edit usernames, but could not start or check a quest natively.

## What changed

### Backend

Added `POST /api/mobile/quest`:

- `action: "start"` with `challengeId` calls the existing website `startChallenge` server-action semantics.
- `action: "check"` calls the existing website `checkActiveChallenge` server-action semantics.
- unauthenticated requests return JSON errors instead of a web redirect;
- successful requests return a small JSON status so the app can refresh `/api/mobile/account`.

Because `src/proxy.ts` already covers `/api/mobile/(.*)`, the new route is inside Clerk middleware.

### Mobile app

Updated `apps/mobile/App.tsx`:

- build label: `Android preview 0.2.17 / quest actions`;
- added `Website parity action` cards to quest detail and status surfaces;
- signed-in/synced users can start the selected quest from mobile;
- signed-in/synced users can run latest-game check for the active quest from mobile;
- after action success, mobile refreshes the account mirror;
- signed-out or unsynced users see clear disabled-state copy.

Updated mobile API/types:

- `runMobileQuestAction(...)` in `apps/mobile/src/api/sqc.ts`;
- `MobileQuestActionResponse` in `apps/mobile/src/types/sqc.ts`.

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck` — passed
- `pnpm lint` — passed with the same 3 known warnings
- `pnpm build` — passed; route list includes `/api/mobile/quest`
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-quest-actions` — passed
- Local production server smoke: anonymous `POST /api/mobile/quest` returned expected `401` JSON (`You must be signed in.`)

## Impact

Mobile now has the first real solo quest-loop parity action: users can start and check quests natively once signed in and synced, while the website backend remains the source of truth for verification, proof, and progress.
