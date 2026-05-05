# SQC homepage private-beta trust card — live deploy proof

Date: 2026-05-03 03:20 Europe/Stockholm

## Change

Tightened the homepage trust card for friends/private beta readiness:

- clarifies that Side Quest Chess checks public Lichess and Chess.com game records only
- warns testers never to share chess-site passwords
- points confusing receipt reports toward support/privacy and proof rules

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-dsfmecjgo-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-dsfmecjgo-andreas-nordenadlers-projects.vercel.app/` → HTTP 200
  - `https://sidequestchess.com/` → HTTP 200
  - `https://sidequestchess.com/support` → HTTP 200
  - `https://sidequestchess.com/rules` → HTTP 200
- Live content assertions ✅
  - `Trust basics`
  - `Public games only. No password nonsense.`
  - `never share chess-site passwords`
  - `Proof rules`
- Vercel error-log check ✅
  - ``vercel logs cc-dsfmecjgo-andreas-nordenadlers-projects.vercel.app --no-follow --level error --limit 20` returned `No logs found`.`

## Notes

This supports the active launch-readiness/private-beta hardening lane without changing auth, verifier behavior, chess API access, or route structure.
