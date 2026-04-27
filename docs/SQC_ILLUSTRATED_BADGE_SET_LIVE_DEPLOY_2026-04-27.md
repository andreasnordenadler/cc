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

Andreas clarified that transparency should exist only outside the crest, not inside shield/banner/interior artwork. I repaired all `/badges/v2/*.png` and `/sqc-logo-v2.png` masks so only border-connected transparent canvas remains transparent, while internal holes/panels are filled back from the source artwork. I also zeroed RGB under fully transparent pixels to avoid viewer/cache artifacts. Visual QA passed on representative queenless/no-castle/logo assets: no obvious rectangular backgrounds and no interior transparency holes. `pnpm lint` and `pnpm build` passed. Production deploy completed: `https://cc-8ksofh0mm-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`. Production smoke passed for `/challenges`, `/badges`, `/badges/v2/no-castle-club-badge.png`, `/badges/v2/queen-never-heard-of-her.png`, and `/sqc-logo-v2.png`; remote PNGs report RGBA alpha. Vercel 500/501/502/503/504 scan returned no logs.

## 13:35 illustrated badge wrapper fix

Andreas showed the live `/challenges` page still reading as non-transparent because the transparent crest assets were being placed inside `ChallengeBadge`'s glowing rounded token wrapper. I changed illustrated badge rendering to add an `illustrated` class, remove the synthetic ribbon/rounded card/background/border/shadow wrapper for image-backed badges, and let the crest art float directly inside the challenge card. `pnpm lint`/`pnpm build` and deploy proof pending.

Production deploy completed: `https://cc-mq6gsf2ze-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`. Production smoke confirmed `/challenges` and `/badges` include `challenge-badge-token illustrated` and `/badges/v2/` references, representative badge PNG served 200, and Vercel 500/501/502/503/504 scan returned no logs.

## 13:50 correct badge-image-only transparency repair

Andreas clarified that the intended transparency is only the square/canvas behind each small illustrated badge image (for example the black square behind King Walk Club), while the badge panel/card UI and all badge artwork/text should remain otherwise unchanged. I reverted the overcorrected floating badge presentation, restored the normal token wrapper and ribbon, then regenerated the v2 badge masks using a dilated foreground barrier so the hard square canvas outside the crest image is transparent while central shield/banner/artwork stays opaque. Magenta-background QA on no-castle, blunder-gambit, and queenless now shows no hard rectangular image backgrounds and no obvious central-art holes; only ornamental perimeter cutouts remain transparent. `pnpm lint` and `pnpm build` passed. Deployed `https://cc-m7qavj1fd-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/challenges`, `/badges`, and representative `/badges/v2/*.png`; Vercel 500/501/502/503/504 scan returned no logs.

## 13:56 v3 reset from original illustrated badges

Andreas provided the intended transparency reference and clarified the prior transparency repairs should restart from the original illustrated badges, before any cleanup that affected badge interiors. I restored the six generated badges from commit `dd65ecb`, used Andreas's new queenless reference image for the queenless badge, generated cache-busting `/badges/v3/*.png` assets, and cut out only border-connected square/canvas background while preserving all interior badge artwork as opaque. Magenta-background QA passed for queenless, no-castle, blunder-gambit, and pawn-storm: outside shows magenta, central shield/banner/crest art remains intact, and hard square backgrounds are gone. Product metadata now points from `/badges/v2/` to `/badges/v3/`. `pnpm lint` and `pnpm build` passed. Local smoke passed for `/challenges`, `/badges`, and representative `/badges/v3/*.png`. Deployed `https://cc-mgnei2a2g-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/challenges`, `/badges`, and representative `/badges/v3/*.png`; Vercel 500/501/502/503/504 scan returned no logs.

## 14:33 white outer matte removal

Andreas clarified the final desired look using the Blunder Gambit example: preserve the badge card/panel and all interior crest artwork, but remove the white sticker-like outer matte around the illustrated crest itself. I removed only exterior white/off-white matte pixels connected to outside transparency from all `/badges/v3/*.png` plus `/sqc-logo-v2.png`, preserving cream banners/shields and internal artwork. Dark-background QA passed on Blunder Gambit, Queenless, No Castle, Pawn Storm, and the SQC logo: no obvious white sticker outline remains, with badge artwork intact. `pnpm lint` and `pnpm build` passed. Deployed `https://cc-8x5c1wga6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/challenges`, `/badges`, representative `/badges/v3/*.png`, and `/sqc-logo-v2.png`; Vercel 500/501/502/503/504 scan returned no logs.

## 15:10 cache-bust badge/logo asset paths and bypass optimizer

Production screenshots still showed the old white-matte badge variants despite the source assets being corrected. Root cause is likely cached Next image-optimized variants and reused public asset paths. I copied the corrected assets to cache-busting `/badges/v4/*.png`, copied the logo to `/sqc-logo-v3.png`, updated challenge metadata/logo references, and set badge/logo `next/image` usages to `unoptimized` so the browser receives the actual PNG path rather than cached optimizer output. `pnpm lint` and `pnpm build` passed. Production deploy pending.

## 15:24 black exterior matte removal

Andreas confirmed the updated badges looked good except for remaining black outside/backing around some badge silhouettes. I created cache-busting `/badges/v6/*.png` from the corrected v4 assets and `/sqc-logo-v5.png` from the corrected logo, then removed dark/black exterior matte pixels only when connected to outside transparency. Purple-background QA passed on No Castle, Blunder Gambit, Queenless, Pawn Storm, and the SQC logo: the black exterior backing is gone and interior dark text/linework/art remains readable. Metadata/logo references now point to v6/v5 and continue to bypass the Next image optimizer. `pnpm lint` and `pnpm build` passed. Deployed `https://cc-1sr75ymh3-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/challenges`, `/badges`, `/challenges/no-castle-club`, representative `/badges/v6/*.png`, and `/sqc-logo-v5.png`; production HTML has no `/_next/image` badge/logo optimizer URLs; Vercel 500/501/502/503/504 scan returned no logs.
