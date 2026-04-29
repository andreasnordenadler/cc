# SQC private beta friend invite live deploy — 2026-04-29

## Change

Added a copy/paste friend invite block to `/beta` so Andreas can ask a tester to run the private-beta loop without rewriting instructions each time.

The invite gives one crisp sequence:

1. Open `https://sidequestchess.com/beta`.
2. Sign in and save either a Lichess or Chess.com username.
3. Pick one weird win-required quest.
4. Play a real game, return to Account, and verify latest game.
5. Send back challenge, chess source, receipt outcome, and confusing moments.

## Local verification

- `pnpm lint` ✅
- `pnpm build` ✅

## Deploy

- Production deploy: `https://cc-8c26ysnlt-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

## Live smoke

Python `urllib` smoke checks because `curl` is unavailable in this runtime:

- Preview `/beta`: HTTP 200, contains `Want to test Side Quest Chess?` ✅
- Canonical `/beta`: HTTP 200, contains `Want to test Side Quest Chess?` ✅
- Canonical `/account`: HTTP 200, contains `Choose one of the ten dual-host starter quests` ✅
- Canonical `/connect`: HTTP 200, contains `Chess.com` ✅

## Impact

The friends/private beta page now includes the tester script, feedback template, example report, and a ready-to-send invite note in one place.
