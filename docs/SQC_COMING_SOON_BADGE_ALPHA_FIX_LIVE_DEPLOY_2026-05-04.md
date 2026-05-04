# SQC coming-soon badge alpha fix live deploy — 2026-05-04

## Result

Removed the rectangular black background/matte from the ten coming-soon quest badge PNGs so the badge art now renders as transparent coat-of-arms assets instead of black boxed images.

## Changed assets

- `public/badges/v6/coming-soon/pawn-only-picnic-badge.png`
- `public/badges/v6/coming-soon/back-rank-goblin-badge.png`
- `public/badges/v6/coming-soon/late-castle-lifestyle-badge.png`
- `public/badges/v6/coming-soon/rook-lift-internship-badge.png`
- `public/badges/v6/coming-soon/double-check-drama-badge.png`
- `public/badges/v6/coming-soon/en-passant-tax-badge.png`
- `public/badges/v6/coming-soon/sacrifice-tax-bracket-badge.png`
- `public/badges/v6/coming-soon/queen-side-quest-badge.png`
- `public/badges/v6/coming-soon/underpromotion-union-badge.png`
- `public/badges/v6/coming-soon/lone-king-witness-protection-badge.png`

## Proof

- Visual QA: inspected the transparent PNGs and white-background composites; badge art remains recognizable and the rectangular black backgrounds are removed.
- Local checks: `pnpm lint` passed; `pnpm build` passed.
- Commit: `5d6017d` (`Remove black backgrounds from coming soon badges`).
- Push: `5d6017d` pushed to `origin/main`.
- Production deploy: `https://cc-j9wq3sje1-andreas-nordenadlers-projects.vercel.app`.
- Production alias: `https://sidequestchess.com`.
- Live smoke: `/`, `/challenges`, `/badges`, and `/today` returned HTTP 200 from `https://sidequestchess.com`.
- Live PNG smoke: `/badges/v6/coming-soon/pawn-only-picnic-badge.png` and `/badges/v6/coming-soon/queen-side-quest-badge.png` returned HTTP 200 `image/png`, decoded as 1024×1024 PNGs with color type 6 alpha.

## User-visible effect

The coming-soon quest badges no longer show ugly black square backgrounds on live surfaces that render them, preserving the playful coat-of-arms look for the launch-polish quest deck.
