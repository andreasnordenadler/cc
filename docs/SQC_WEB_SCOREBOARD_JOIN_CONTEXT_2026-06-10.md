# SQC Web Scoreboard Join Context — 2026-06-10

Closed a small website Official Leaderboards parity gap versus mobile-v251: the mobile Official Leaderboards rows carry viewer-aware context (`joined`, `hosted`, proof progress, or sign-in/join hints), while website `/scoreboard` only listed official rows and linked to detail pages.

## Shipped

- Added signed-in viewer context to website `/scoreboard` official leaderboard rows:
  - `Hosted by you` when the current user hosts the table.
  - `Joined by you` plus verified quest count for active official rows.
  - final-result context for joined finished rows.
  - safe not-joined / sign-in hints for other states.
- Kept the existing official leaderboard layout, row styling, and detail-page links.
- Preserved privacy boundaries: no participant emails, invite codes, private tables, or account metadata are exposed.

## Verification

- `pnpm lint -- src/app/scoreboard/page.tsx`
- `pnpm build`
- Commit: `0b533f3`
- Production deploy: `https://cc-r5t7bghbq-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: production and deploy `/scoreboard?joinContextSmoke=20260610` returned 200 with `Official Leaderboards`, `Current week`, and signed-out join/compare context.
