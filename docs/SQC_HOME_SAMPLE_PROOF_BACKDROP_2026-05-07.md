# SQC Homepage Sample Proof Backdrop — 2026-05-07

## Trigger

Andreas suggested using the sample proof scroll recommendation visually by placing it in the background of the signed-out homepage explainer section, slightly blurred and slanted behind the text.

## Change

Added a signed-out-only generated example proof scroll behind the `What happens after sign-in` section on the homepage.

- Uses a fictional/demo `finish-any-game` proof payload.
- Renders through the existing generated proof PNG route (`/api/og/proof/[token]`).
- Places the proof image as an absolute background layer behind the explainer content.
- Applies rotation, blur, opacity, and a dark overlay to keep text readable.
- Adjusts mobile positioning/opacity so the scroll remains decorative instead of competing with copy.

## Files changed

- `src/app/page.tsx`
- `src/app/globals.css`

## Verification

- `pnpm lint` passed with known warnings only.
- `pnpm build` passed.
- Production deploy succeeded and aliased to `https://sidequestchess.com`.
- Signed-out homepage HTML contains the proof backdrop section and generated proof path.
- Extracted generated proof image returned `200 image/png` at `1200 x 1600`.
- Production smoke checks for `/`, `/challenges`, and `/account` returned 200.
- Vercel production error logs showed no recent errors.
