# SQC One Bishop Lichess Verifier Live Deploy — 2026-04-28

## What changed

Promoted `One Bishop to Rule Them All` from specified-only to a live-backed Lichess latest-game verifier.

Implemented:
- `src/lib/one-bishop-to-rule-them-all.ts`
  - normalizes latest Lichess UCI move history into a final minor-piece state
  - checks standard chess, bullet/blitz/rapid/unknown eligibility, minimum 15 moves, player win, exactly one final player bishop, and zero final player knights
  - includes deterministic fallback fixtures for signed-out/review use
- `tests/one-bishop-to-rule-them-all-fixtures.mjs`
  - pass/fail fixture coverage
  - UCI normalization coverage for final single-bishop evidence
- `src/app/actions.ts`
  - active latest-game checker now uses the real One Bishop verifier when a Lichess username is saved
- `src/lib/verifier-status.ts`
  - `/verifiers` and verifier badges now mark One Bishop as live-backed

## Verification

Local checks:

```bash
node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs tests/rookless-rampage-fixtures.mjs tests/one-bishop-to-rule-them-all-fixtures.mjs
pnpm lint
pnpm build
```

Result: passed.

Local route smoke against `localhost:3011`:

```text
200 /verifiers
200 /challenges/one-bishop-to-rule-them-all
200 /account
200 /api/og/dare/one-bishop-to-rule-them-all
```

Production deploy:

```bash
vercel --prod --yes
```

Result:
- deployment: `https://cc-fvd6ulzmk-andreas-nordenadlers-projects.vercel.app`
- alias: `https://sidequestchess.com`

Production smoke:

```text
200 https://sidequestchess.com/verifiers
200 https://sidequestchess.com/challenges/one-bishop-to-rule-them-all
200 https://sidequestchess.com/account
200 https://sidequestchess.com/api/og/dare/one-bishop-to-rule-them-all
```

Content smoke:
- `/verifiers` contains `One Bishop to Rule Them All`
- `/verifiers` contains `exactly one final player bishop`

Bounded Vercel log scan:
- no `ERROR`, `Error`, or `500`/`501`/`502`/`503`/`504` lines surfaced during the bounded post-deploy stream.

## Notes

This keeps the product promise honest: the challenge is now live-backed for connected Lichess usernames, while the remaining `The Blunder Gambit` challenge stays specified-only until its material-loss detector is implemented.
