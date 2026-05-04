# SQC crisp CSS active quest stamp live deploy — 2026-05-04

## Goal

Finish the active stamp style correction requested at 18:12: replace the low-resolution SVG-like active quest stamp with the same crisp CSS/sticker direction as the COMING SOON stamp, but green.

## Shipped

- Deployed commit `5cf9b13` (`Use crisp CSS active quest stamp`) to production.
- The active quest marker now renders from CSS (`.active-quest-stamp`) with green uppercase stamp styling instead of relying on the previous image asset treatment.
- Preserved the recently shipped quest-switch confirmation dialog with current/new coat-of-arms cards.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview URL: `https://cc-mb9z01cdi-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Vercel inspect ✅
  - Deployment id: `dpl_BZzKvPVNzWCiSc683Ro52UpnuQH6`
  - Status: `Ready`
- Live route smoke ✅
  - `https://cc-mb9z01cdi-andreas-nordenadlers-projects.vercel.app/challenges/bishop-field-trip` → 200
  - `https://sidequestchess.com/challenges/bishop-field-trip` → 200
  - `https://sidequestchess.com/challenges` → 200
  - `https://sidequestchess.com/` → 200
- Live CSS assertion ✅
  - Canonical CSS chunk contains `active-quest-stamp` and `ACTIVE QUEST`.

## User-visible effect

Active quests now get a sharper, higher-quality green stamp treatment that matches the newer sticker language instead of looking like a low-resolution asset.
