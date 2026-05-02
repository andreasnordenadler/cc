# SQC recommended quest logos — 2026-05-02

## Source

Andreas asked: “Recommended first quests” should show the logos of the quests.

## Change

- Added compact quest badge/logo art to each homepage recommended first quest row.
- Kept the simplified list structure from the previous feedback pass; this adds visual identity without returning to large nested cards.
- Reused existing `ChallengeBadge` rendering so the logos match challenge/badge surfaces.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed: `https://cc-9uk4infq9-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Manually reassigned `sidequestchess.com` and `www.sidequestchess.com` aliases to the latest deployment after deploy.
- Live smoke passed for apex, www redirect, and `/challenges`; homepage HTML contains `quest-list-logo`, `challenge-badge-token`, and `Recommended first quests`.
