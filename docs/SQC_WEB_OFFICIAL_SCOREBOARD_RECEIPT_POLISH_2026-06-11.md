# SQC Web Official Scoreboard Receipt Polish — 2026-06-11

## Scope
Continued the SQC website UX parity sprint on the official Scoreboard surface (`/scoreboard`). The goal was visible polish and clearer proof-receipt language without changing Multiplayer verifier or join behavior.

## Shipped
- Added an SQC-styled `How the hall works` guide that explains the official leaderboard flow as: join the table, check real games, keep the receipt.
- Upgraded official leaderboard rows from plain status rows into receipt-oriented cards with visible player count, verified quest count, run window, podium context, and deliberate table/receipt CTAs.
- Kept mobile stacking tidy with responsive scoreboard guide/cards.

## Verification
- `pnpm lint -- src/app/scoreboard/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- Commit/push: `fe5fd6c` (`Polish official scoreboard receipts`)
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-ftl33vzn4-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/scoreboard?scoreboardReceiptSmoke=20260611` returned 200 with `How the hall works` and `Pick a table, prove games, keep the receipt`.
  - `https://cc-ftl33vzn4-andreas-nordenadlers-projects.vercel.app/scoreboard?scoreboardReceiptSmoke=20260611` returned 200 with the same guide copy.
  - `https://sidequestchess.com/scoreboard?scoreboardReceiptSmoke=20260611b` returned 200 with `View final receipt`.
  - `https://sidequestchess.com/groupquests/public?scoreboardReceiptSmoke=20260611` returned 200 with Public Multiplayer discovery content.
