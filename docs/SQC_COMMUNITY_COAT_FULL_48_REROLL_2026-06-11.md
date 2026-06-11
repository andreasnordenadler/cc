# SQC Community Solo coat reroll to full 48-pool — 2026-06-11

## Summary
Rerolled existing public/published Community Solo Side Quest coat assignments across the full 48-image community-only coat pool.

## Scope
- Target: existing public/published Community Solo Side Quests stored in Clerk metadata.
- Pool: `/badges/custom/community/community-coat-01.png` through `/badges/custom/community/community-coat-48.png`.
- No official SQC badge art reused.
- No legacy `/badges/custom/custom-side-quest-crest.png` or `/badges/custom/custom-coat-*.png` paths retained.

## Actions
- Confirmed live asset availability: `https://sidequestchess.com/badges/custom/community/community-coat-48.png` returned HTTP 200.
- Dry-run: `node scripts/randomize-community-coats.mjs --reroll-all`
  - users scanned: 63
  - users to update: 35
  - quests to update: 47
  - pool size: 48
  - dry-run backup: `artifacts/metadata-backups/community-coats-before-2026-06-11T19-14-01-092Z.json`
- Applied: `node scripts/randomize-community-coats.mjs --reroll-all --apply`
  - apply backup: `artifacts/metadata-backups/community-coats-before-2026-06-11T19-14-23-094Z.json`

## Verification
Metadata verification after apply:
- users scanned: 63
- public/published Community Solo quests: 47
- invalid coat paths: 0
- unique coats used by existing 47 quests: 30 of 48
- examples included `community-coat-37`, `community-coat-38`, `community-coat-45`, `community-coat-30`, `community-coat-27`, `community-coat-10`, and `community-coat-48`.

Live smoke:
- `https://sidequestchess.com/challenges/community` returned HTTP 200.
- `https://sidequestchess.com/badges/custom/community/community-coat-03.png` returned HTTP 200.
- `https://sidequestchess.com/badges/custom/community/community-coat-48.png` returned HTTP 200.
- Live community page HTML contained 47 `/badges/custom/community/community-coat-*.png` refs.
- Live community page HTML contained no old generic `/badges/custom/custom-side-quest-crest.png` refs.
- Live community page HTML contained no old `/badges/custom/custom-coat-*.png` refs.
- Live community page HTML contained no official badge image refs.
- Browser-rendered top page screenshot loaded successfully; full-page screenshot capture was blocked by local optional `sharp` dependency, so HTML/image-ref proof is the final rendered-card source check for this run.

## Result
Complete. Existing Community Solo quests now use the full community-only 48-coat pool, with valid live asset paths and no old/official art paths observed.
