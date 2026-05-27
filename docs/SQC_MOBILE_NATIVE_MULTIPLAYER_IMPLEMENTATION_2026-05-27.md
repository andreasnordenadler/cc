# SQC Mobile Native Multiplayer Implementation — 2026-05-27

## Scope
Implemented native SQC Mobile multiplayer lifecycle support so users can stay inside the app for official and community Multiplayer Side Quests.

## Added
- Native mobile account payload now includes:
  - active joined Multiplayer Side Quests
  - max 3 active official SQC Multiplayer Side Quests
  - public user-created Multiplayer Side Quests
  - rule rows, included Side Quests, leaderboard rows, points, verified counts, and join state
- Native mobile action endpoint: `POST /api/mobile/groupquests/[id]`
  - `create`: create public or private-key Multiplayer Side Quest and auto-join host
  - `join`: join official/public rooms or private rooms by invite key
  - `leave`: leave joined rooms
  - `refresh`: run public-game proof checks and update multiplayer progress
- Private invite-key path:
  - route id `invite` + body `{ action: "join", inviteKey }`
  - hidden/private rooms are not listed publicly
- Group quest model now supports `inviteMode: "private-key"` and `inviteKey`.
- Mobile app UI now includes:
  - official Multiplayer Side Quest browse/join cards
  - public community Multiplayer Side Quest browse/join cards
  - private invite-key input + join action
  - native create flow with name, public/private access, and up-to-four included Side Quests
  - joined status/progress/proof refresh/leave flows via existing modal language
- Multiplayer refresh now also merges passed multiplayer Side Quest checks into solo completion progress, preserving the “multiplayer completions count as solo completions too” rule.

## Files changed intentionally for this implementation
- `apps/mobile/App.tsx`
- `apps/mobile/src/api/sqc.ts`
- `apps/mobile/src/types/sqc.ts`
- `src/app/api/mobile/account/route.ts`
- `src/app/api/mobile/groupquests/[id]/route.ts`
- `src/app/api/groupquests/[id]/route.ts`
- `src/lib/groupquests.ts`
- `ROADMAP.md`

## Verification
Passed:
- `pnpm lint -- 'src/lib/groupquests.ts' 'src/app/api/groupquests/[id]/route.ts' 'src/app/api/mobile/account/route.ts' 'src/app/api/mobile/groupquests/[id]/route.ts' 'apps/mobile/App.tsx' 'apps/mobile/src/api/sqc.ts' 'apps/mobile/src/types/sqc.ts'`
- `pnpm --filter @sidequestchess/mobile typecheck`
- `pnpm build`
- Local server smoke:
  - `GET /api/mobile/account` unauthenticated returned `401` expected mobile JSON
  - `POST /api/mobile/groupquests/test` unauthenticated returned `401` expected mobile JSON
  - `POST /api/groupquests` unauthenticated returned `401 sign_in_required`

Blocked:
- Android APK assembly passed after exporting the known Mac mini Java/Android SDK environment.

## Deployment note
This is source-ready locally but not production-shipped yet. Production still needs the normal guarded deploy path after deciding how to handle the currently dirty repo / behind-main state and after restoring a local JDK or using EAS for APK build verification.
