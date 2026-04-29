# SQC connect dual-host copy live deploy — 2026-04-30

## Burst

Private-beta friction fix for Side Quest Chess: update `/connect` so the first username setup screen no longer implies Lichess is the fastest/default path or that Chess.com has partial quest coverage.

## Change

- Reframed both provider cards as **Full starter-deck support**.
- Clarified that either public Lichess or Chess.com username supports latest-game checks for every current starter-deck quest.
- Kept the no-PGN-upload/no-password-sharing trust cue visible on the Chess.com card.
- Fixed the signed-out copy from "remember your Lichess username" to "remember your chess usernames".

## Files changed

- `src/app/connect/page.tsx`

## Verification

- `pnpm install --frozen-lockfile`
- `pnpm lint` — passed
- `pnpm build` — passed
- Production deploy to canonical Vercel project `cc` — passed
- Live smoke `https://cc-73nvty5ae-andreas-nordenadlers-projects.vercel.app/connect` — HTTP 200, contained `Full starter-deck support`
- Live smoke `https://sidequestchess.com/connect` — HTTP 200, contained `Full starter-deck support`
- Live smoke `https://sidequestchess.com/beta` — HTTP 200, contained `Friends / private beta`

Build note: Next.js still warns about multiple workspace lockfiles/root inference locally; build completed successfully.

## User-visible impact

A first private-beta tester opening `/connect` now sees accurate provider parity: either chess site works for the full starter deck today, reducing setup hesitation and stale "more parity coming" confusion.


## Deployment

- Production deployment: `https://cc-73nvty5ae-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Commit: `6e28005 Clarify dual-host connect setup`
