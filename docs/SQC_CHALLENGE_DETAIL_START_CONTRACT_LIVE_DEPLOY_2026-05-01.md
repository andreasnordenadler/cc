# SQC challenge detail start contract — live deploy proof

Date: 2026-05-01 14:18 Europe/Stockholm
Project: CC / Side Quest Chess

## What changed

Tightened the existing challenge-detail proof-path block into a clearer “Before you start” contract:

- Accept this exact dare.
- Win one real public Lichess or Chess.com game.
- Check the latest game for a pass/fail/pending receipt without PGN upload.

Also tightened challenge detail metadata so shared challenge previews mention the real win + latest-game verification path instead of sounding like a generic unlock card.

## Files changed

- `src/app/challenges/[id]/page.tsx`
- `ROADMAP.md`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-lpvt9n5cb-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-lpvt9n5cb-andreas-nordenadlers-projects.vercel.app/challenges/knights-before-coffee` → HTTP 200
  - `https://sidequestchess.com/challenges/knights-before-coffee` → HTTP 200
  - `https://sidequestchess.com/challenges` → HTTP 200
  - `https://sidequestchess.com/account` → HTTP 200
- Live content assertion ✅
  - Canonical challenge detail contains: `Before you start`, `One dare, one real win, one latest-game check.`, `no PGN upload`, `quest only counts after a win`, `Check latest games`.
- Bounded Vercel log watch ✅
  - Stream opened for deployment; no runtime errors emitted during the watch window.

## Impact

Private-beta testers now get the SQC proof contract directly on quest-detail pages before they click start, reducing ambiguity about win-required quests, public-game sources, and latest-game proof.
