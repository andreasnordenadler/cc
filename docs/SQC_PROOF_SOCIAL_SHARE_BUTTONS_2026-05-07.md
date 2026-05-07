# SQC Proof Social Share Buttons — 2026-05-07

## Trigger

Andreas reported that the completed-quest `Share` button did not work or make sense and asked for working social media sharing buttons instead.

## Change

Replaced the generic Web Share API-first proof button with explicit share targets in `src/components/share-proof-actions.tsx`:

- X / Twitter intent
- Facebook sharer
- Reddit submit
- WhatsApp text share
- Telegram URL share
- LinkedIn share

Added fallback utility buttons:

- `Copy proof link`
- `Copy image link`
- `Download image`

The buttons share the public `/proof/[token]` URL so social crawlers can use the Open Graph/Twitter metadata and the generated proof PNG preview. The direct image utilities remain available for services that need an uploaded image file or raw image URL.

## Files changed

- `src/components/share-proof-actions.tsx`
- `src/app/challenges/[id]/page.tsx`
- `src/app/proof/[token]/page.tsx`
- `src/app/result/page.tsx`
- `src/app/globals.css`
- `ROADMAP.md`

## Verification

- `pnpm lint` passed with known warnings only.
- `pnpm build` passed.

## Notes

Most social platforms do not allow arbitrary websites to pre-upload an image into a post composer. The reliable pattern is to share a public proof URL with OG metadata and provide download/copy-image fallbacks for manual image upload.
