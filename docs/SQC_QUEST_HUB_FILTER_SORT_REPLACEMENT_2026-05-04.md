# SQC quest hub filter/sort replacement — 2026-05-04

## Change

Andreas requested removing the `Full quest deck` intro block and replacing it with an actual filter/sort function.

Implemented:

- Added client-side `ChallengeDeckBrowser` component.
- Removed the `Full quest deck` intro section from `/challenges`.
- Added real controls for:
  - difficulty filter: All / Easy / Medium / Hard / Brutal / Absurd
  - status filter: All / Active / Completed / Open
  - sorting: Recommended / Easy first / Hard first / Most points / Fewest points
- Added live count of visible quests.
- Kept the full quest card grid below the controls.
- Kept `Recommended starter route` at the bottom.

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed.
- Production deploy — passed: `https://cc-77i1vgh6c-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke for `/challenges` — passed; filter/sort copy present and old `Ready for the rest of the bad ideas?` / `Full quest deck` intro copy absent.
