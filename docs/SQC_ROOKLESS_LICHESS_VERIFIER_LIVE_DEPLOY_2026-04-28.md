# SQC Rookless Rampage Lichess verifier live deploy — 2026-04-28

## Burst

Promoted `Rookless Rampage` from specified-only to a live-backed Lichess latest-game verifier.

## What changed

- Added `src/lib/rookless-rampage.ts` with provider-neutral rule evaluation and Lichess latest-game normalization.
- Tracks original rook identities (`a1`/`h1` or `a8`/`h8`) through movement/castling and captures, so moved rooks still count when they disappear.
- Wired `/account` latest-game checking to use the live Rookless verifier when a Lichess username is stored, with deterministic fallback fixtures for review.
- Updated verifier status copy so `/verifiers`, challenge pages, daily/random/share surfaces, and related trust badges can mark Rookless Rampage as live-backed.
- Added deterministic fixture coverage in `tests/rookless-rampage-fixtures.mjs`.

## Verification

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs tests/rookless-rampage-fixtures.mjs` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Local production smoke on port 3199 ✅
  - `/verifiers`
  - `/challenges/rookless-rampage`
  - `/account`
  - `/api/og/dare/rookless-rampage`

## Deploy proof

- Production deploy: `https://cc-gzih5276z-andreas-nordenadlers-projects.vercel.app` ✅
- Alias: `https://sidequestchess.com` ✅
- Production smoke ✅
  - `https://sidequestchess.com/verifiers` → 200
  - `https://sidequestchess.com/challenges/rookless-rampage` → 200
  - `https://sidequestchess.com/account` → 200
  - `https://sidequestchess.com/api/og/dare/rookless-rampage` → 200
- Production content check: `/verifiers` contains `Rookless Rampage` and `Live-backed` ✅
- Vercel production error scan: no error-level runtime logs found in the checked window; one non-blocking OG image CSS warning was present for the new OG route.
