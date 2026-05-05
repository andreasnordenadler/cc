# SQC starter path alignment live deploy — 2026-05-03

## Summary
Aligned the first-run starter path across the most visible SQC entry surfaces so new players are no longer pointed at different “starter” sets depending on where they land.

## Changed
- Homepage recommended quest art now matches the canonical Starter path trio:
  - Knights Before Coffee
  - Bishop Field Trip
  - Early King Walk
- Primary nav now puts `Starter path` before `Quests`.
- `/challenges` recommended starter route now mirrors the same three-step ladder instead of mixing in No Castle Club / Queen? Never Heard of Her.
- `/connect` post-setup handoff now links directly to `/path`.
- `/account` first-test route/preflight copy now uses the same starter-path trio before the full deck.

## Verification
- `pnpm lint` ✅
- `pnpm build` ✅
- Vercel production deploy ✅
- Live smoke ✅
  - `https://sidequestchess.com/` returned 200 and contains `Bishop Field Trip`, `Early King Walk`, and `Start starter path`.
  - `https://sidequestchess.com/path` returned 200 and contains the starter path trio.
  - `https://sidequestchess.com/challenges` returned 200 and contains `Bishop restraint`, `King-walk stretch`, and the Starter path alignment copy.
  - `https://sidequestchess.com/connect` returned 200 and contains `Open starter path` / `use the starter path`.

## Deployment
- Production deploy URL: `https://cc-5s8q5xna4-andreas-nordenadlers-projects.vercel.app`
- Canonical: `https://sidequestchess.com`

## Notes
A bounded Vercel log follow-up produced no log output before the local tool timeout; route/content smoke checks are the proof for this burst.
