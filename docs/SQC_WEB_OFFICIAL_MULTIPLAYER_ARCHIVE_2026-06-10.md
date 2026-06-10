# SQC web official Multiplayer archive parity — 2026-06-10

Sprint: SQC website parity sprint (2026-06-09 17:35 → 2026-06-10 17:35 Europe/Stockholm)

## Shipped

- Fixed `/groupquests/public` finished/all filters so finished public Multiplayer Side Quests remain discoverable instead of being removed before filtering.
- Official SQC Multiplayer Side Quests now use the same public discovery lane for finished/archive views, matching the mobile official leaderboard archive model.
- The finished official lane is labelled `Official SQC Multiplayer archive` and keeps final leaderboard/detail links inspectable after the event window closes.
- Private invite-only tables remain hidden; host shelves still apply only to community-hosted public tables.

## Verification

- `pnpm lint -- src/app/groupquests/public/page.tsx`
- `pnpm build`
- Commit: `97a4b9f` (`Add official multiplayer archive lane`)
- Production deploy: `https://cc-8xb4y2lnq-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: `/groupquests/public?status=finished&archiveSmoke=20260610` returned 200 with `Official SQC Multiplayer archive`, 18 official finished rows, final leaderboard/detail links, and community finished rows; `/groupquests/public?status=all&archiveSmoke=20260610` returned 200 with official + community all-status rows; `/groupquests/public?archiveSmoke=20260610` returned 200.
