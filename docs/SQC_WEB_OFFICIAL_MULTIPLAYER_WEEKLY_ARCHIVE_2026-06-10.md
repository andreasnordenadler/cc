# SQC Web Official Multiplayer Weekly Archive — 2026-06-10

## Slice

Closed the website parity gap where mobile-v251 exposed a signed-in Official Leaderboards surface with current official events, previous official results, and a weekly archive, while website `/groupquests` only surfaced current official public tables.

## Shipped

- Added a signed-in `Previous official results` lane to `/groupquests` using the existing compact/finished Multiplayer row patterns.
- Added an `Official weekly archive` lane grouping finished official SQC Multiplayer Side Quests by week.
- Each archived result links back to the final Multiplayer detail/leaderboard page.
- Private invite-only and community host shelves remain unchanged; no participant emails or private account metadata are exposed.

## Verification

- `pnpm lint -- src/app/groupquests/page.tsx`
- `pnpm build`
- Commit/push: `6b7a5f9` (`Add official Multiplayer weekly archive`)
- Production deploy: `https://cc-eanev1k6c-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/groupquests?weeklyArchiveSmoke=20260610` returned 200 with Multiplayer/flow content.
  - `https://sidequestchess.com/groupquests/public?status=finished&weeklyArchiveSmoke=20260610` returned 200 with `Official SQC Multiplayer archive`.

## Notes

This complements the public `/groupquests/public?status=finished` archive by making the signed-in Multiplayer command center match the mobile official leaderboard lanes without changing the site's navigation or visual language.
