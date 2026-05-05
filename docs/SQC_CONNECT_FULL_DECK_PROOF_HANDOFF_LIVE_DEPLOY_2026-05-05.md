# SQC connect full-deck proof handoff — live deploy (2026-05-05)

## Change
- Updated `/connect` so Chess.com copy reflects the current full ten-quest starter-deck latest-game support instead of stale partial-parity wording.
- Added signed-in next-step CTAs from saved identities to `/path`, `/today`, and `/result`.
- Replaced signed-out secondary CTAs with `/path` preview and `/support` safety notes so first-time testers can understand the loop before signing in.

## Commit
- `2d18a61` — `Tighten SQC connect proof handoff`

## Verification
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅: `https://cc-j7paush9l-andreas-nordenadlers-projects.vercel.app`
- Alias ✅: `https://sidequestchess.com`
- Live smoke ✅:
  - `https://sidequestchess.com/connect` returned HTTP 200 and contained `Full starter-deck tracking`, `all ten current starter-deck quests`, `Preview starter path`, and `Read beta safety notes`.
  - `https://cc-j7paush9l-andreas-nordenadlers-projects.vercel.app/connect` returned HTTP 200 with the same content assertions.
  - `https://sidequestchess.com/path` returned HTTP 200 and contained `Three bad ideas, in survivable order.`
  - `https://sidequestchess.com/support` returned HTTP 200.
- Vercel inspect/log proof ✅: deployment status `Ready`; build completed successfully with no runtime error output in the inspected deployment logs.

## User-visible impact
The proof-account setup route now tells private-beta testers the truth: both Lichess and Chess.com can run the full current starter deck, and the page routes them immediately toward the beginner path, daily quest, receipt check, or safety/support notes instead of leaving setup as a dead end.
