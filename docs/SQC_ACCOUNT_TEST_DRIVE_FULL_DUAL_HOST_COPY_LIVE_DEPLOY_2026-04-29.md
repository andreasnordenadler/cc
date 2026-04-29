# SQC account test-drive full dual-host copy — live deploy proof

Date: 2026-04-29 08:42 Europe/Stockholm
Project: Side Quest Chess / CC

## Change

Updated `/account` private-beta test-drive copy so it no longer implies the manual QA path is Lichess-first after full dual-host coverage landed.

## User-visible effect

- Step 1 now asks testers to save either chess username.
- Step 2 now says all ten starter dares can verify Lichess or Chess.com games.
- Step 3 clarifies the expected receipt states: pass, fail, or pending.
- The quest launcher intro now states every current quest can create latest-game receipts from Lichess or Chess.com today.

## Verification

- `pnpm install --frozen-lockfile` completed for the clean isolated worktree after the first lint attempt found no local dependencies.
- `pnpm lint` passed.
- `pnpm build` passed.

## Deployment

Production deploy `https://cc-c4h1qeypl-andreas-nordenadlers-projects.vercel.app` completed and was aliased to `https://sidequestchess.com`. Live smoke confirmed both production URLs returned HTTP 200 for `/account` and contained the new strings: `either chess username`, `all ten can verify Lichess or Chess.com games`, `pass, fail, or pending receipt`, and `automated latest-game receipts from Lichess or Chess.com today`.
