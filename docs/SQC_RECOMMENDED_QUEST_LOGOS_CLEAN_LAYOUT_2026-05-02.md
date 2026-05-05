# SQC recommended quest logos clean layout — 2026-05-02

## Source

Andreas asked for the recommended quest logos to appear without boxes around them, with text under each logo.

## Change

- Changed recommended quest rows into centered logo-over-text cards.
- Removed the visible logo container/background/border treatment.
- Kept the clickable quest list compact and reused existing badge art.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed: `https://cc-l2rxb0ouw-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Manually reassigned `sidequestchess.com` and `www.sidequestchess.com` aliases to this deployment.
- Live smoke passed for apex and www redirect; homepage HTML contains `clean-quest-logo-card`, `clean-quest-logo`, `clean-quest-copy`, and `Recommended first quests`.
