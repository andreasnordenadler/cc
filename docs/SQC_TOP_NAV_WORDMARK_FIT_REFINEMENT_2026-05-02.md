# SQC top nav wordmark fit refinement — 2026-05-02

## Source

Andreas reported the top-bar “Side Quest Chess” wordmark was not showing properly and asked for a smaller picture wordmark closer to the logo typography.

## Change

- Replaced the wide SVG text wordmark with a generated transparent PNG wordmark (`public/sqc-wordmark.png`).
- Used a serif treatment with navy fill and gold stroke to better match the original logo direction.
- Reduced the displayed nav width so the full wordmark fits comfortably in the top bar.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed via prebuilt output: `https://cc-1mo1cnifk-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Manually reassigned `sidequestchess.com` and `www.sidequestchess.com` aliases to this deployment.
- Live smoke passed for apex and www redirect: homepage contains `sqc-wordmark.png` and `nav-wordmark`, no longer contains `sqc-wordmark.svg` or `Start quest`, and still contains `final-bare-quest-logo`.
- Direct `https://sidequestchess.com/sqc-wordmark.png` returned PNG image data (`980 x 150`, transparent RGBA).
