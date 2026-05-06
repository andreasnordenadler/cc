# SQC public proof share links and image — 2026-05-06

## Scope
Andreas asked whether the scroll proof could become an image users can share, or whether sharing should link to this specific user's proof instead of the current generic links.

## Changes made

- Added signed public proof tokens in `src/lib/proof-share.ts`.
- Added public proof pages at `/proof/[token]` that render the completed user's proof without requiring the viewer to be signed in as that user.
- Added proof OpenGraph image route at `/api/og/proof/[token]`, so shared proof links have a scroll-style image preview.
- Updated completed proof share actions to use the public signed proof URL instead of the generic `/result?challengeId=...` URL.
- Added a `Proof image` link beside the proof actions.
- Updated `/result` passed-state share actions to share the signed public proof URL.
- Extracted the victory scroll into a reusable component for the completed proof card and public proof page.

## Notes

- The link is user/attempt-specific because the signed token contains the completed challenge proof payload.
- The token is HMAC-signed using server secret material, so users cannot edit the proof payload without invalidating the link.
- The URL intentionally exposes only share-safe proof data: challenge, badge, points, receipt summary, dates, game/provider IDs, and optional first-name/username label used for sharing.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed and included `/proof/[token]` plus `/api/og/proof/[token]` routes.
