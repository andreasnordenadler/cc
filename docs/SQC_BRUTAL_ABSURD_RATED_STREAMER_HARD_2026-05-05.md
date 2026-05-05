# SQC Brutal/Absurd streamer-hard pass — 2026-05-05

## Shipped decision

- Brutal quests stay eligible for rated or casual games in v1, but their live copy is now explicitly streamer-hard / clip-worthy rather than ordinary hard-mode.
- Absurd quests are now the no-excuses tier: **rated games only** for proof value and future leaderboard fairness.

## Product changes

- `Queen? Never Heard of Her`
  - reframed as a streamer-hard queen-loss comeback.
  - raised reward to 650 points.
  - tightened visible rules to require at least 15 moves.
- `Knightmare Mode`
  - reframed as a public-game knight-mate clip quest.
  - raised reward to 750 points.
  - tightened visible rules to require at least 15 moves.
- `Rookless Rampage`
  - reframed as rated-only Absurd proof.
  - raised reward to 1200 points.
  - visible rules now require rated games and both original rooks gone before move 20.
  - verifier now fails unrated/casual games before awarding the Absurd receipt.
- Coming-soon Brutal/Absurd cards now mirror the same design canon:
  - Brutal = streamer-hard, casual or rated acceptable.
  - Absurd = rated-only absurd proof.

## Verification

- `pnpm exec node --experimental-strip-types --test tests/rookless-rampage-fixtures.mjs` ✅
- `pnpm lint` ✅ (1 pre-existing warning in `scripts/deploy-production-guard.mjs`)
- `pnpm build` ✅
- `pnpm deploy:prod` ✅
- Vercel production deployment: `https://cc-ggtl8noji-andreas-nordenadlers-projects.vercel.app` ✅ Ready
- Aliased to `https://sidequestchess.com` and `https://www.sidequestchess.com` ✅
- Live smoke: `/challenges/rookless-rampage`, `/challenges/queen-never-heard-of-her`, `/challenges/knightmare-mode`, and `/challenges` returned HTTP 200 with rated-only / Brutal-copy assertions ✅

## Notes

`pnpm lint` initially got killed because ESLint traversed archived `.worktrees/**/.next/**` output. Added `eslint.config.mjs` ignores for `.worktrees/**` and `tmp/**`, then reran lint/build successfully.
