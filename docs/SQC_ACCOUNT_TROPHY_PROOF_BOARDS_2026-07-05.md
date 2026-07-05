# SQC Account Trophy Proof Boards - 2026-07-05

## Why

Andreas noticed that verification chess boards were not visible on the web surfaces he was reviewing. The board renderer existed on proof/detail routes, and mobile already showed proof boards on completed proof surfaces, but the web Account/Trophy Cabinet receipt cards only showed receipt copy and links.

## Change

- Exported a compact reusable proof-board renderer from `src/components/proof-position-board.tsx`.
- Added compact proof chess boards to official completed Solo receipt cards on `/account` when a saved `finalPositionFen` exists.
- Added compact proof chess boards to custom completed Solo receipt cards on `/account` when a saved `finalPositionFen` exists.
- Added the current active/completed Solo proof board to the top `/account` current mission panel, matching the mobile Account active proof summary.
- Added signed-in proof-board coverage to `/trophy-cabinet` via the coat room/Trophy Cabinet page, matching the mobile Trophy Cabinet/completed-proof expectation.
- Reused the existing FEN parser, last-move highlighting, board colors, and accessible square labels.

## Verification

- `pnpm lint -- src/app/account/page.tsx src/app/badges/page.tsx src/components/proof-position-board.tsx src/app/globals.css` passed with the expected CSS ignore warning.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
