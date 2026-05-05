# SQC restore Home nav after wordmark removal — 2026-05-03

## Context

After the visible top-bar wordmark was removed, the live primary nav no longer exposed the explicit `Home` link that Andreas had requested before `Quests`.

## Change

Restored the `Home` navigation item as the first primary nav link while keeping the wordmark/brand text removed and leaving the existing `Quests`, `Today`, `Badges`, `Support`, auth, and signed-in account actions unchanged.

## Verification

Completed before deploy:
- `pnpm install --frozen-lockfile`
- `pnpm lint` ✅
- `pnpm build` ✅

Completed after deploy:
- production deploy: `https://cc-luvgvuna8-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com` ✅
- live smoke for deploy `/`: `Home` rendered before `Quests`, `Support` still present, removed wordmark classes/text absent ✅
- live smoke for canonical `/`: `Home` rendered before `Quests`, `Support` still present, removed wordmark classes/text absent ✅
- Vercel deployment error-log scan: no logs found / no errors emitted ✅
