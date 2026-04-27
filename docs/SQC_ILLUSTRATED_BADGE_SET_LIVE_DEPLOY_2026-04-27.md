# SQC illustrated badge set live deploy — 2026-04-27

## Change

Completed the first full illustrated Side Quest Chess starter badge set in Andreas's supplied heraldic style.

The supplied **Queen? Never Heard of Her** badge remains the canonical style reference, and the six remaining starter challenges now have matching high-detail illustrated coat-of-arms badge assets wired through `badgeIdentity.image`.

Follow-up from Andreas at 11:04 CEST: all badges should have transparent backgrounds, and the crest should not feel like a box inside a box. The runtime badge assets were updated to RGBA PNGs with transparent backgrounds; the original queenless JPEG remains only as the style reference.

## New badge assets

- `public/badges/queen-never-heard-of-her.png` — transparent runtime asset converted from Andreas's supplied reference
- `public/badges/no-castle-club-badge.png`
- `public/badges/the-blunder-gambit-badge.png`
- `public/badges/pawn-storm-maniac-badge.png`
- `public/badges/knightmare-mode-badge.png`
- `public/badges/rookless-rampage-badge.png`
- `public/badges/one-bishop-to-rule-them-all-badge.png`

## Files changed

- `src/lib/challenges.ts` — wired the generated illustrated badge images into the six remaining starter challenge badge identities.
- `public/badges/*` — added/updated the illustrated badge PNG assets and converted the runtime set to transparent RGBA PNGs.
- `docs/SQC_BADGE_STYLE_CANON_2026-04-27.md` — updated the badge canon with the generated asset set, transparent-background requirement, no box-inside-box rule, and prompts.

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

## 11:04 transparency follow-up verification

- All seven runtime badge PNGs now report PNG color type `6` (RGBA alpha). ✅
- Border alpha checks show the square/card background is not opaque around the badge bounds. ✅
- `Queen? Never Heard of Her` now points to `public/badges/queen-never-heard-of-her.png`, not the original JPEG reference. ✅
- The style canon now requires transparent backgrounds and freestanding heraldic composition without box-inside-box framing. ✅
- Local checks after transparency conversion: `pnpm lint`, `pnpm build`, route smoke, and asset alpha smoke passed. ✅
- Production redeploy after removing the temporary local `sharp` helper dependency from the deployment context: `https://cc-5irr006vl-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`. ✅
- Production smoke passed for `/badges`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, `/dare/queen-never-heard-of-her`, `/scoreboard`, and all seven badge PNGs; each remote PNG reports RGBA alpha. ✅
- Vercel production error-log scan found no logs in the last 30m. ✅

## 12:57 cache-bust + card alignment follow-up

Andreas reported the app still showed non-transparent-looking badge squares and misaligned challenge-card title text. Root cause: the deployed page was still referencing the same public image filenames, so browser/Vercel image caches could continue showing older baked-background files; additionally the compact badge/title row used two columns, leaving long challenge titles squeezed into a narrow column.

Fix applied:

- Created cache-busting transparent runtime paths under `public/badges/v2/` for all seven starter badge PNGs.
- Updated all `badgeIdentity.image` paths to `/badges/v2/...`.
- Created cache-busting logo path `public/sqc-logo-v2.png` and updated nav/home references.
- Changed challenge-card title rows to single-column layout so badge and title/objective stack cleanly instead of compressing title text.
- Verified local PNG signatures/alpha for all v2 badge/logo assets. ✅
- Verified `pnpm lint`, `pnpm build`, and local route/asset smoke for `/challenges`, `/badges`, `/`, `/sqc-logo-v2.png`, and representative `/badges/v2/*.png`. ✅
- Production deploy completed: `https://cc-bbcjeupzi-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`. ✅
- Production smoke passed for `/challenges`, `/badges`, `/`, `/sqc-logo-v2.png`, and representative `/badges/v2/*.png`. ✅
- Vercel 500/501/502/503/504 scan returned no logs in the last 30m. ✅


## Notes

Two image-generation attempts aborted during asset creation; both affected prompts were retried successfully. One local smoke command initially failed because this shell did not resolve bare `wc`/`grep`; reran with `/usr/bin/wc` and `/usr/bin/grep` successfully.

## 13:08 outside-only transparency repair

Andreas clarified that transparency should exist only outside the crest, not inside shield/banner/interior artwork. I repaired all `/badges/v2/*.png` and `/sqc-logo-v2.png` masks so only border-connected transparent canvas remains transparent, while internal holes/panels are filled back from the source artwork. I also zeroed RGB under fully transparent pixels to avoid viewer/cache artifacts. Visual QA passed on representative queenless/no-castle/logo assets: no obvious rectangular backgrounds and no interior transparency holes. `pnpm lint` and `pnpm build` passed. Production deploy/smoke pending.
