# SQC full victory scroll image share — 2026-05-07

## Request
Andreas asked whether the completed victory scroll could be generated as one image, including the existing text, badge, proof line, date/points, and wax seal, so it is easier to share.

## Change
- Converted the public proof image route (`/api/og/proof/[token]`) from a compact preview approximation into a full vertical 1200×1600 PNG scroll image.
- The generated image now includes the actual quest coat-of-arms asset when available, the scroll text, proof receipt line, date, points, and the SQC wax seal.
- Public proof metadata now advertises the vertical proof-scroll dimensions.
- Result sharing now points to the user-specific public proof URL instead of the generic homepage while still attaching the generated proof image when the platform supports file sharing.

## Verification
- `pnpm lint` passed with pre-existing warnings only.
- `pnpm build` passed.
- Local smoke generated a PNG from `/api/og/proof/[token]` and verified `200 OK`, `content-type: image/png`, and `1200 x 1600` output.
- Visual inspection confirmed the generated file is a complete vertical scroll card with badge art, text, date/points, and wax seal.
