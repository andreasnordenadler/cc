# SQC private beta full dual-host deck verification — 2026-04-29

## Result

Green. `https://sidequestchess.com` currently exposes the full 10-quest starter/private-beta deck as live-backed Lichess + Chess.com latest-game verification.

Verified quests:

1. Knights Before Coffee
2. Bishop Field Trip
3. Early King Walk
4. Queen? Never Heard of Her
5. No Castle Club
6. The Blunder Gambit
7. Pawn Storm Maniac
8. Knightmare Mode
9. Rookless Rampage
10. One Bishop to Rule Them All

## Local verification

From clean worktree at `origin/main` commit `3d4f08e`:

- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ — 43/43 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅

## Production smoke

Production route/content smoke passed for:

- `/verifiers` — all 10 quest names plus `Live-backed Lichess + Chess.com latest-game verifier`
- `/beta` — private beta + Lichess/Chess.com trust copy
- `/connect` — Lichess/Chess.com account setup copy
- `/account` — quest launcher + Chess.com copy
- `/challenges/knights-before-coffee`
- `/challenges/bishop-field-trip`
- `/challenges/early-king-walk`
- `/challenges/queen-never-heard-of-her`
- `/challenges/no-castle-club`
- `/challenges/the-blunder-gambit`
- `/challenges/pawn-storm-maniac`
- `/challenges/knightmare-mode`
- `/challenges/rookless-rampage`
- `/challenges/one-bishop-to-rule-them-all`

Each challenge route returned HTTP 200 and included the dual-host live-backed verifier string.

## Vercel log check

`vercel logs --project cc --environment production --level error --since 30m --no-follow --no-branch --limit 20` returned no production 500/error entries. It surfaced one warning-only OG image CSS compatibility log for `/api/og/dare/bishop-field-trip` with HTTP 200.

## Notes

The main shared checkout still contains unrelated dirty files from previous local runs, so this verification intentionally used a clean isolated worktree. No production deploy was needed in this burst because `origin/main` had already been deployed and the live site matched the full dual-host deck state.
