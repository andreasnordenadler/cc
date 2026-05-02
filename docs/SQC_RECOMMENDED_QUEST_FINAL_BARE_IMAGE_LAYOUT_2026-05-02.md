# SQC recommended quest final bare image layout — 2026-05-02

## Source

Andreas reported he still could not see the intended clean recommended-quest logo layout.

## Change

- Replaced the reusable `ChallengeBadge` wrapper in homepage recommendations with direct badge image rendering.
- Added inline layout/background overrides on the recommended quest links and text block, so browser-cached CSS cannot preserve the old square/pill/circle wrappers.
- Kept each whole logo/text block clickable.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed via prebuilt output: `https://cc-rkjfofxuz-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Manually reassigned `sidequestchess.com` and `www.sidequestchess.com` aliases to this deployment.
- Live smoke passed for apex and www redirect. Homepage HTML contains `final-bare-quest-card`, `final-bare-quest-logo`, `background:transparent`, and `Recommended first quests`, and no longer contains `challenge-badge-token` or `badge-token-motif` in the homepage recommendation markup.
