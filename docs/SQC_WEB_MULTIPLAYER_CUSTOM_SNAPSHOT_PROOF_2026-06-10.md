# SQC web Multiplayer custom snapshot proof parity — 2026-06-10

## Slice

Closed the website gap left after custom Multiplayer lineups could be created/edited: `/groupquests/[id]` and the Multiplayer refresh API now understand saved Custom Solo snapshots instead of silently dropping non-official quest IDs from detail/proof views.

## Shipped

- Multiplayer detail pages resolve each lineup ID as either an official Side Quest or a saved Custom Solo snapshot.
- Invite and accepted detail views show Custom Solo snapshot rows with the saved badge/title/summary context instead of linking to a missing official challenge route.
- Leaderboard proof rows and score totals include custom snapshot rewards.
- `/api/groupquests/[id]/refresh` passes saved custom snapshots into the existing custom verifier path so latest-game Multiplayer proof can evaluate custom lineup entries.
- Private/raw custom config remains hidden from the website detail UI.

## Verification

- `pnpm lint -- 'src/app/groupquests/[id]/page.tsx' 'src/app/api/groupquests/[id]/refresh/route.ts'`
- `pnpm build`
- Commit/push: `3beb693` (`Support custom Multiplayer proof snapshots on web`)
- Production deploy: `https://cc-5i43z4pk8-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?customSnapshotSmoke=20260610` returned 200 with Multiplayer detail content.
  - `https://sidequestchess.com/groupquests/public?customSnapshotSmoke=20260610` returned 200 with Public Multiplayer content.
  - Signed-out `POST https://sidequestchess.com/api/groupquests/seed-public-sqcseed11-11/refresh` returned 401 `sign_in_required`.

## Notes

No live/pickable quest release was added. This only makes already-saved website/mobile custom Multiplayer lineups render and verify through existing custom snapshot/verifier semantics.
