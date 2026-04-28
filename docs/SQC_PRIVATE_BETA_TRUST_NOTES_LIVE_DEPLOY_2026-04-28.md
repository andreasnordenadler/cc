# SQC private beta trust notes live deploy — 2026-04-28

## Burst

Added a dedicated `/beta` surface for Side Quest Chess friends/private beta hardening.

## User-visible changes

- New `/beta` page explains the private-beta posture before public launch pressure.
- Beta checklist links testers to connect a chess identity, try the beginner path, and create an honest receipt from `/account`.
- Trust basics now state:
  - SQC uses public Lichess/Chess.com game evidence for supplied usernames.
  - Testers should not share chess-site passwords.
  - Friends/private beta support should report confusing verifier outcomes or UI/badge issues to Andreas with challenge name and game link.
- Home page and top navigation now expose the private beta notes.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
  - Production deployment: `https://cc-f1kco3nz8-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Live smoke checks ✅
  - `https://cc-f1kco3nz8-andreas-nordenadlers-projects.vercel.app/beta` → HTTP 200
  - `https://sidequestchess.com/beta` → HTTP 200
  - `https://sidequestchess.com/` → HTTP 200
  - `https://sidequestchess.com/connect` → HTTP 200
- Live content assertions ✅
  - `/beta` contains `Friends / private beta`, `Public chess evidence only`, `No chess-site passwords`, and `Tell Andreas what broke`.
  - `/` contains `Private beta notes` and `Test the loop before launch hype`.
- Vercel production error log scan ✅
  - `vercel logs --environment production --level error --since 10m --no-branch --limit 50`
  - Result: `No logs found for andreas-nordenadlers-projects/cc`

## Notes

This advances the active friends/private beta readiness item without changing verifier rules, auth flows, or production data behavior.
