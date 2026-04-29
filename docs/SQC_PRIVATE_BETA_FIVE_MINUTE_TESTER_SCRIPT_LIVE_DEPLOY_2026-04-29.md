# SQC private beta five-minute tester script live deploy — 2026-04-29

## What changed

Added a dedicated five-minute tester script to `/beta` so friends/private beta testers have one exact loop to run instead of a vague product tour:

1. Add one Lichess or Chess.com username.
2. Pick a survivable weird win from the beginner path or full dual-host deck.
3. Bring back one latest-game receipt and report whether it passed, failed honestly, or got confusing.

## Why

Side Quest Chess is now past the full dual-host starter-deck milestone. The next visible private-beta value is making the first tester session easier for Andreas to hand to friends: identity → quest → receipt.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview: `https://cc-oste6sqk4-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://sidequestchess.com/beta` returned `200` and contained `5-minute tester script`, `identity`, `quest`, and `receipt`.
  - Preview `/beta` returned `200` and contained the same tester-script strings.
  - `https://sidequestchess.com/account` returned `200`.
  - `https://sidequestchess.com/connect` returned `200`.
