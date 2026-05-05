# SQC rankings / top players / quest popularity / statistics loops — 2026-05-05

## Scope

Fresh-baseline reconfirmed backlog item: design rankings, top players, quest popularity, and statistics loops for Side Quest Chess.

## Shipped implementation

- Reworked `/scoreboard` into a visible **Rankings design** hub instead of a personal-only score page.
- Added `Rankings` to the top navigation so the loop is discoverable from the live product.
- Kept all global leaderboard/stat copy honest: no fake user counts, no invented popularity numbers.
- Defined the launch scoring model in-product:
  - top players ranked by verified points;
  - tie-break by hard/Absurd/Brutal clears;
  - tie-break by newest verified receipt;
  - quest popularity based on starts, clears, fails, shares, and receipt events;
  - stats sourced from latest-game proof receipts.
- Preserved current signed-in personal progress from Clerk metadata: points, completed quest count, provider receipt counts, active/earned quest state.
- Added per-quest popularity launch cards showing the exact future telemetry inputs without pretending aggregate data exists yet.

## Files changed

- `src/app/scoreboard/page.tsx`
- `src/components/site-nav.tsx`
- `src/app/globals.css`
- `ROADMAP.md`

## Verification

- `pnpm lint` passed with existing warnings only:
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - existing nav `<img>` warning
- `pnpm build` passed.

## Deployment proof

- Code commit: `e18138a` (`Design SQC rankings loops`), pushed to `origin/main`.
- Production deploy: `https://cc-6j3vupylh-andreas-nordenadlers-projects.vercel.app`
- Aliased to: `https://sidequestchess.com` and `https://www.sidequestchess.com`
- `vercel inspect` status: `Ready`.

## Live smoke

- `https://cc-6j3vupylh-andreas-nordenadlers-projects.vercel.app/scoreboard` → HTTP 200
- `https://sidequestchess.com/scoreboard` → HTTP 200
- `https://sidequestchess.com/` → HTTP 200
- `https://sidequestchess.com/challenges` → HTTP 200
- Canonical `/scoreboard` contains: `Rankings design`, `Leaderboard fuel, without fake numbers.`, `Top players loop`, `Quest popularity`, `Popularity inputs`.
- Canonical `/` and `/challenges` contain the new top-nav `Rankings` link.
- Vercel production error-log scan (`--level error --since 30m`) returned no logs.
