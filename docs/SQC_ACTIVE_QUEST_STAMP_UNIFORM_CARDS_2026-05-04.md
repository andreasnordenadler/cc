# SQC active quest stamp + uniform quest cards — 2026-05-04

## Change

Andreas requested replacing the separate active-quest pill with a custom stamp/sticker graphic placed on top of the card, and making quest cards the same size instead of varying by copy length.

Implemented:

- Added custom stamp artwork at `public/active-quest-stamp.svg`.
- Replaced visible `Active quest` pill markup with an overlaid `active-quest-stamp` on active quest cards.
- Removed the old inline/bottom active pill styling.
- Made full quest deck cards use uniform height/row sizing.
- Applied the stamp treatment to both full deck cards and starter-route cards when active.

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed.
- Production deploy — passed: `https://cc-cglbakfd6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke — passed for `/challenges` and direct `/active-quest-stamp.svg`; old `active-quest-inline` marker is absent from signed-out challenge HTML.
