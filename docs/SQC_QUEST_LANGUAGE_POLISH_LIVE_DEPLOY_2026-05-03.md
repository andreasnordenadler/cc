# SQC Quest Language Polish — Live Deploy

Date: 2026-05-03 21:00 Europe/Stockholm

## Summary

Polished visible Side Quest Chess language so first-run surfaces consistently present the product as quests, not mixed challenge/dare framing.

## Changed

- Top nav now labels the hub as `Quests`.
- Homepage CTAs and mission cards now use quest framing for today, random, hub, badges, scoreboard, verifier board, share kit, and signed-out browse copy.
- `/challenges` hero/status copy now presents the surface as the `Quest Hub` while preserving existing `/challenges` route URLs and internal model names.
- `/today`, `/random`, `/path`, `/share-kit`, account action errors, invite copy, and verifier fallback wording now avoid stale challenge/dare wording where it would confuse users.

## Safety notes

- No auth, profile, verifier, route, metadata shape, chess-provider, or production data behavior was changed.
- Existing `/challenges/*`, `/dare/*`, and OG routes were preserved.
- Work was done in isolated worktree branch `sqc-quest-language` because the main checkout had unrelated dirty files.

## Proof

- Commit: `173b244` (`Polish SQC quest language`)
- Branch pushed: `origin/sqc-quest-language`
- Local verification:
  - `pnpm install --frozen-lockfile` ✅
  - `pnpm lint` ✅
  - `pnpm build` ✅
- Production deploy:
  - Deploy URL: `https://cc-olqz1vx3k-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke:
  - Deploy `/` HTTP 200 with `Open today’s quest`, `Quest Hub`, `Random quest machine` ✅
  - Canonical `/` HTTP 200 with `Open today’s quest`, `Quest Hub`, `Random quest machine` ✅
  - Canonical `/challenges` HTTP 200 with `Quest Hub`, `Active quest`, `Available quests` ✅
  - Canonical `/today` HTTP 200 with `Start today’s quest`, `Open friend quest` ✅
  - Canonical `/share-kit` HTTP 200 with `Share today’s quest`, `friend-quest URL` ✅

## Follow-up

Open/merge PR from `sqc-quest-language` after reviewing against the dirty main checkout, or cherry-pick commit `173b244` once the main working tree is cleaned up.
