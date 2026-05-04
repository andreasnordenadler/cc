# SQC quest card points + active line refinement — 2026-05-04

## Change

Andreas noted that the green `Active quest` indicator looked awkward in the middle of the quest card and suggested moving it to the bottom line, while also moving points to the top-left corner for all cards.

Implemented:

- Full quest deck cards now show reward points in the top-left and difficulty in the top-right.
- Starter route cards now use the same points-left / difficulty-right rhythm.
- Removed the large mid-card green active banner.
- Active quest state now appears as a smaller bottom-line state integrated with completion status.

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed.
- Production deploy — passed: `https://cc-notfdfwu4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke for `/challenges` — passed on canonical and deployment URL; `quest-points` present and old `active-quest-callout` absent.
