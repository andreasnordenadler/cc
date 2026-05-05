# SQC top nav wordmark polish — 2026-05-02

## Source

Andreas asked to remove the top-bar `Start quest` button and replace the `SQC` pill with a transparent `SIDE QUEST CHESS` graphic in the logo typography direction.

## Change

- Added transparent `public/sqc-wordmark.svg` wordmark graphic.
- Replaced the top-left `SQC` text pill with the wordmark image.
- Removed the signed-in top-bar `Start quest` button; primary quest entry remains in nav (`Quests`) and homepage CTAs.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed via prebuilt output: `https://cc-bhb7famne-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Manually reassigned `sidequestchess.com` and `www.sidequestchess.com` aliases to this deployment.
- Live smoke passed for apex and www redirect: homepage contains `sqc-wordmark.svg` and `nav-wordmark`, no longer contains `Start quest`, and still contains `final-bare-quest-logo`.
- Direct `https://sidequestchess.com/sqc-wordmark.svg` returned the transparent SVG wordmark.
