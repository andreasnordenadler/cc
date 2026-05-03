# SQC homepage private-beta trust strip — live deploy proof

Date: 2026-05-03 03:05 Europe/Stockholm

## Change

Added a visible homepage trust strip for friends/private beta testers:

- clarifies that Side Quest Chess checks public Lichess and Chess.com game records only
- warns testers never to share chess-site passwords
- links directly to proof rules and the beta support packet

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-6m7w694xx-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-6m7w694xx-andreas-nordenadlers-projects.vercel.app/` → HTTP 200
  - `https://sidequestchess.com/` → HTTP 200
  - `https://sidequestchess.com/rules` → HTTP 200
  - `https://sidequestchess.com/beta` → HTTP 200
- Live content assertions ✅
  - `Private beta trust basics`
  - `Real games, public data, no password nonsense.`
  - `never share chess-site passwords`
  - `Open support packet`
- Vercel error-log check ✅
  - `vercel logs cc-6m7w694xx-andreas-nordenadlers-projects.vercel.app --no-follow --level error --limit 20` returned `No logs found`.

## Notes

This supports the active private/friends beta hardening lane without changing auth, verifier behavior, chess API access, or route structure.
