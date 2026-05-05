# SQC recommended quest bare badge layout — 2026-05-02

## Source

Andreas said the recommended quest section was almost good, but asked to remove the remaining squares, the roundish background behind the text, and the circle behind the badges.

## Change

- Removed recommended quest row/card square backgrounds and borders by default.
- Removed the difficulty text pill background.
- Removed the circular motif background inside generated badge symbols.
- Kept a very subtle hover/focus state only for click affordance.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Initial normal Vercel deploys queued/stalled; removed queued/stuck deployment attempts and completed a prebuilt deploy.
- Production deploy completed: `https://cc-6n6tracn7-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Manually reassigned `sidequestchess.com` and `www.sidequestchess.com` aliases to this deployment.
- Live smoke passed for apex and www redirect; homepage HTML contains `clean-quest-logo-card` and `Recommended first quests`.
