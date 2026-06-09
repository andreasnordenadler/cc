# SQC Web Community Solo Share Controls — 2026-06-10

Sprint: SQC website parity sprint, 2026-06-09 17:35 → 2026-06-10 17:35 Europe/Stockholm.

## Gap closed

Mobile exposes public Community Solo share actions, while the website Community Solo detail copy promised sharing but did not provide explicit public-link/social share controls on the detail surface or on the owner's public custom recipe cards.

## Shipped

- Added a `Share public link` anchor to public Community Solo detail hero actions.
- Added an in-page share card on `/challenges/community/[id]` with canonical public quest URL copy and social share controls.
- Added the same canonical public quest copy/share controls to public recipes on `/account/custom-side-quests` owner library cards.
- Generalized the existing proof share component labels/copy so it can share public quests without changing proof receipt behavior.
- Kept raw custom configs, draft/private/archived recipes, and private account metadata out of shared payloads.

## Verification

- `pnpm lint -- src/components/share-proof-actions.tsx 'src/app/challenges/community/[id]/page.tsx' src/app/account/custom-side-quests/page.tsx`
- `pnpm build`

## Production smoke

- Commit: `fd1b3b5`
- Deploy: `https://cc-155zz02sc-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- `https://sidequestchess.com/challenges/community/seed-opening-hipster-32-1?shareControlsSmoke=20260610` returned 200 and included `Share public link`, `Copy public quest link`, and `Send this public recipe`.
- `https://sidequestchess.com/challenges/community?shareControlsSmoke=20260610` returned 200 with Community Solo content.
- Signed-out `https://sidequestchess.com/account/custom-side-quests?shareControlsSmoke=20260610` resolved to `/sign-in`.
- Seeded detail smoke checked that raw/private markers (`privateMetadata`, `publicMetadata`, `customSideQuests`, `creatorUserId`, `blocks`, `pieceState`, `openingSequence`) were absent from the HTML.
