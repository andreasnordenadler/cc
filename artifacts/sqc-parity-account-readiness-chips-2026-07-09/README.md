# SQC Account Readiness Chips Parity Slice - 2026-07-09

Target: logged-in Account readiness chips.

App evidence inspected before edit:
- Current `apps/mobile/App.tsx` `AccountTrackerDashboard` renders the Lichess and Chess.com readiness chips with `onAdd={() => openUsernameEditor(...)}`.
- `openUsernameEditor` requests the provider field and scrolls to the in-page `ChessUsernameEditor`, keeping the user on Account.
- Same-sprint app screenshot reference: `artifacts/sqc-app-web-parity-2026-07-08/emulator/app-account.png`.

Web evidence before edit:
- Signed-in Sam production `/account?proof=readiness-before`.
- Browser snapshot showed `Lichess and72nor` and `Chess.com and72nor` readiness chips both linked to `/settings`.
- Screenshot: `artifacts/sqc-parity-account-readiness-chips-2026-07-09/web-account-before.png`.

Visible difference before edit:
- Android app keeps the user on Account and scrolls to the matching username editor field.
- Mobile web navigated away to `/settings`, breaking the app's in-page edit path.

Web change:
- Account readiness chips now link to `#lichess-username` and `#chesscom-username`.
- The matching profile editor inputs now have stable IDs so the browser jumps to the app-equivalent in-page editor fields.

Checks before deploy:
- Focused source smoke passed for both hash links, both input IDs, and removal of the old `/settings` chip target.
- `pnpm lint` passed with 4 existing warnings.
- `pnpm build` passed.

Commit/deploy:
- Commit: `670eea4` (`Match SQC account readiness chips to app`), pushed to `main`.
- Guarded deploy: `pnpm deploy:prod`.
- Production deployment: `https://cc-2yq824128-andreas-nordenadlers-projects.vercel.app`.
- Alias: `https://sidequestchess.com`.

Live proof:
- `https://sidequestchess.com/account?proof=670eea4` loaded in the signed-in Sam browser.
- Browser snapshot showed the readiness chips now link to `#lichess-username` and `#chesscom-username`.
- Click smoke on the Lichess chip stayed on `/account`, changed the URL to `#lichess-username`, and left the Lichess username input visible.
- Live proof files: `live-dom-smoke.json` and `web-account-live-after-click.png`.
- Bounded Vercel log stream grep returned no `500`, `error`, or `exception` rows.
