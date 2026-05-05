# SQC starter path proof eligibility checklist — live deploy

Date: 2026-05-04 10:59 Europe/Stockholm  
Owner: Sam

## What changed

Added a visible **Before you play** checklist to `/path` so first private-beta testers know how to make their next game count before leaving SQC to play elsewhere.

The new starter-path guidance spells out:

- latest public Lichess or Chess.com game is what gets checked
- standard chess only
- bullet, blitz, or rapid is the clean v1 proof window
- quest rule plus a win is required
- direct links to `/rules` and `/account` for proof-rule review and latest-game checking

## Why

The starter path already chooses the first three quests well, but a tester could still leave the page without knowing the exact eligibility conditions. This reduces avoidable failed/pending receipts during friends/private beta.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-ds1oruzzj-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-ds1oruzzj-andreas-nordenadlers-projects.vercel.app/path` → HTTP 200
  - `https://sidequestchess.com/path` → HTTP 200
  - `https://sidequestchess.com/rules` → HTTP 200
  - `https://sidequestchess.com/account` → HTTP 200
- Live content assertions on canonical `/path` ✅
  - `Before you play`
  - `Make the next game count for proof.`
  - `latest public game`
  - `Standard chess only`
  - `Bullet, blitz, or rapid`
  - `Quest rule + win`
- Bounded Vercel log watch ✅ — no `Error`, `Unhandled`, `ReferenceError`, `TypeError`, or `500` patterns observed.

## Notes

Implemented from a clean isolated worktree based on `origin/main` to avoid the dirty primary CC checkout. After `origin/main` advanced during the burst, the branch was rebased, re-verified, pushed, and redeployed so production matches the final pushed commit.
