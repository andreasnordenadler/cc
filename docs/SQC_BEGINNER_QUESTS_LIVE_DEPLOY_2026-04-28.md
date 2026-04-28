# SQC beginner quests deploy proof — 2026-04-28

## Change
Added three beginner Side Quest Chess quests and rewired the starter path to use them:

1. `Knights Before Coffee` — first four player moves must be knight moves, then finish.
2. `Bishop Field Trip` — move both bishops before moving the queen, then finish.
3. `Early King Walk` — move king before move 12, then finish.

## Notes
- These beginner quests are intentionally marked `Specified`, not fake-live, until their exact automated verifiers are implemented.
- Existing live-backed hard quests remain available and still show `Live-backed` verifier status.
- `/account` now says how many live verifiers exist instead of implying every new beginner quest is automated.

## Verification
- `pnpm lint` passed.
- `pnpm build` passed.
- Production smoke to be recorded after deploy.

## Production deploy
- Commit: `6aad205` (`Add beginner SQC quest path`)
- Deployment: `https://cc-5qb30vois-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Production smoke
- `/path` HTTP 200 and contains all three beginner quests.
- `/challenges` HTTP 200 and contains `Knights Before Coffee` + `Beginner Quest`.
- `/challenges/knights-before-coffee` HTTP 200 and contains `First four player moves were knight moves` + `Specified`.
- `/challenges/bishop-field-trip` HTTP 200 and contains `Both bishops moved before queen moved` + `Specified`.
- `/challenges/early-king-walk` HTTP 200 and contains `King moved before move 12` + `Specified`.
- `/account` HTTP 200 and contains `Quest launcher` + `live verifiers`.
- `/verifiers` HTTP 200 and contains `Knights Before Coffee` + `Specified`.
- 500/502/503/504 scan in recent production logs returned no matching entries.

## Follow-up correction — win required + badges
Andreas clarified that every SQC quest should require a win. The three beginner quests now require wins in objectives, rules, proof callouts, and metadata requirements. Generated and wired illustrated coat-of-arms badge assets for all three beginner quests:

- `public/badges/knights-before-coffee-badge.png`
- `public/badges/bishop-field-trip-badge.png`
- `public/badges/early-king-walk-badge.png`

Image QA passed for ornate/centered/usable coat-of-arms styling; `Bishop Field Trip` has tiny permission-slip text that may be less readable at small sizes, but the main badge/motto composition is usable.

## Follow-up production deploy — win required + badges
- Commit: `177a928` (`Require wins and badge beginner quests`)
- Deployment: `https://cc-b936g8ods-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- `pnpm lint` passed.
- `pnpm build` passed.
- Generated image QA passed for all three new beginner coat-of-arms assets.
- Live smoke passed for `/path`, `/challenges`, `/challenges/knights-before-coffee`, `/challenges/bishop-field-trip`, `/challenges/early-king-walk`, `/badges`, and `/account`.
- Badge asset smoke passed for `/badges/knights-before-coffee-badge.png`, `/badges/bishop-field-trip-badge.png`, and `/badges/early-king-walk-badge.png` (HTTP 200 `image/png`).
- 500/502/503/504 scan in recent production logs returned no matching entries.

## Follow-up correction — remove white square matte
Andreas reported visible white square backgrounds on only the three new beginner badges. I removed exterior white/off-white matte connected to the badge image edges while preserving interior cream/white artwork, then cache-busted the runtime paths to `/badges/v6/...` for those three assets only.
