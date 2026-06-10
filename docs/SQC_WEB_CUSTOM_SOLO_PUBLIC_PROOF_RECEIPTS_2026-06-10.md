# SQC Web Custom Solo Public Proof Receipts — 2026-06-10

## Summary

Closed a Custom Solo completed-proof sharing gap versus mobile-v251. Completed Custom Solo cards on `/account/custom-side-quests` now generate canonical public `/proof/...` receipt links from the latest passed attempt, expose `Open proof receipt` plus copy/social/image share controls, and keep raw custom rule configs/private shelf state hidden.

## What changed

- Added `buildCustomPublicProofPath` for signed Custom Solo proof payloads using safe receipt evidence only: title, custom coat image, fixed Custom Solo reward, sanitized summary, provider/game IDs, checked/completed times, FEN, and last-move fields.
- Updated public proof decoding/pages so valid Custom Solo proof tokens work even when they do not map to an official challenge ID.
- Kept official proof-board behavior intact while allowing Custom Solo public proof pages to show generated scroll/image receipts and verified board evidence when present.
- Updated OG proof images to prefer the badge image stored in the proof payload, so custom coats render in shared proof images.
- Added completed-proof share controls to Custom Solo library cards only when the saved quest is completed and the latest attempt passed.

## Verification

- `pnpm lint -- src/lib/proof-share.ts 'src/app/proof/[token]/page.tsx' 'src/app/api/og/proof/[token]/route.tsx' src/app/account/custom-side-quests/page.tsx`
- `pnpm build`
- Commit: `d7b2a11` (`Add Custom Solo public proof receipts`)
- Production deploy: `https://cc-nax4fcll5-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/account/custom-side-quests?customProofReceiptSmoke=20260610` returned sign-in protection/content for signed-out visitors.
  - `https://sidequestchess.com/proof/preview-finish-any-game?customProofReceiptSmoke=20260610` returned public proof content including `Open proof image`, `Proof board`, `Verified final position`, and `Share proof`.
  - `https://sidequestchess.com/api/og/proof/preview-finish-any-game?customProofReceiptSmoke=20260610` returned `200` `image/png`.
  - Deploy URL public proof preview returned matching proof content.

## Privacy / safety notes

- No raw Custom Solo configs, private library state, invite codes, emails, or private account metadata are embedded in proof tokens.
- Public proof pages continue to reject invalid signatures.
- Older official proof links keep their existing behavior.
