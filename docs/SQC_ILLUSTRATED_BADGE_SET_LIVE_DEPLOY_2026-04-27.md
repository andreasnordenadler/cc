# SQC illustrated badge set live deploy — 2026-04-27

## Change

Completed the first full illustrated Side Quest Chess starter badge set in Andreas's supplied heraldic style.

The supplied **Queen? Never Heard of Her** badge remains the canonical style reference, and the six remaining starter challenges now have matching high-detail illustrated coat-of-arms badge assets wired through `badgeIdentity.image`.

## New badge assets

- `public/badges/no-castle-club-badge.png`
- `public/badges/the-blunder-gambit-badge.png`
- `public/badges/pawn-storm-maniac-badge.png`
- `public/badges/knightmare-mode-badge.png`
- `public/badges/rookless-rampage-badge.png`
- `public/badges/one-bishop-to-rule-them-all-badge.png`

## Files changed

- `src/lib/challenges.ts` — wired the generated illustrated badge images into the six remaining starter challenge badge identities.
- `public/badges/*` — added the six illustrated badge PNG assets.
- `docs/SQC_BADGE_STYLE_CANON_2026-04-27.md` — updated the badge canon with the generated asset set and prompts.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local route/asset smoke on `127.0.0.1:3012` ✅
  - `/badges`
  - `/challenges`
  - `/challenges/queen-never-heard-of-her`
  - `/result`
  - `/dare/queen-never-heard-of-her`
  - `/scoreboard`
  - `/badges/no-castle-club-badge.png`
  - `/badges/one-bishop-to-rule-them-all-badge.png`
- Production deploy ✅
  - Vercel deployment: `https://cc-egss59ks7-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/badges`
  - `https://sidequestchess.com/challenges`
  - `https://sidequestchess.com/challenges/queen-never-heard-of-her`
  - `https://sidequestchess.com/result`
  - `https://sidequestchess.com/dare/queen-never-heard-of-her`
  - `https://sidequestchess.com/scoreboard`
  - all six new `/badges/*.png` assets returned `200`
- Vercel production error-log scan ✅
  - 500: 0 in last 30m
  - 501: 0 in last 30m
  - 502: 0 in last 30m
  - 503: 0 in last 30m
  - 504: 0 in last 30m

## Notes

Two image-generation attempts aborted during asset creation; both affected prompts were retried successfully. One local smoke command initially failed because this shell did not resolve bare `wc`/`grep`; reran with `/usr/bin/wc` and `/usr/bin/grep` successfully.
