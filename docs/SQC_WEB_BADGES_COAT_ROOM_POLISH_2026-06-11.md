# SQC Web Badges Coat Room Polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint by polishing `/badges` as a standalone Coat of Arms/Trophy Cabinet surface instead of a plain heraldry index.

## User-facing changes
- Added an SQC-styled `Coat room guide` that explains the path: choose a crest, play a public game, keep the proof receipt.
- Turned each coat card into a clearer mini quest card with earned/ready status, difficulty, points, category, quest objective, shield meaning, and a `Next step` cue.
- Kept existing SQC visual language and all quest/proof routes unchanged.
- Added phone-width stacking for the guide and badge cards.

## Checks
- `pnpm lint -- src/app/badges/page.tsx src/app/globals.css` — passed; CSS ignored-file warning only.
- `pnpm build` — passed.
- `pnpm deploy:prod` — passed, including `pnpm quest:release-gate`.

## Deploy
- Commit: `aab8cd2` (`Polish badges coat room UX`)
- Production deploy: `https://cc-eksxkcwgp-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`

## Live smoke
- `https://sidequestchess.com/badges?coatRoomSmoke=20260611` — 200, contained `Coat room guide`, `Pick a crest, run the quest, keep the receipt`, `Ready to earn`, and `Browse Solo Side Quests`.
- `https://cc-eksxkcwgp-andreas-nordenadlers-projects.vercel.app/badges?coatRoomSmoke=20260611` — 200 with the same new badges content.
- `https://sidequestchess.com/challenges?coatRoomSmoke=20260611` — 200 with current Official Solo finder content.
- `https://sidequestchess.com/groupquests/public?coatRoomSmoke=20260611` — 200 with current Public Multiplayer discovery content.
