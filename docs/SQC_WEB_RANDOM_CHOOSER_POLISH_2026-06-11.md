# SQC web random chooser polish — 2026-06-11

## Scope

Continued the SQC website UX parity sprint with the standalone `/random` Side Quest chooser. The goal was visible polish, product-language cleanup, and app-quality next-step clarity without changing verifier behavior or releasing new quests.

## Changes

- Replaced the loose random-quest hero action row with an SQC-styled `Next step` panel.
- Renamed the primary actions to clearer player outcomes: spin another quest, start this Solo quest, or share as a friend quest.
- Added an inline `Rule preview` card using the selected Side Quest's existing rule list so players see the proof expectation before sharing.
- Cleaned metadata and support cards to emphasize proof rules, coat/reward continuity, and deliberate run choice instead of harsher/internal-feeling phrasing.
- Preserved existing official quest routes, friend-quest invite links, verifier status copy, and sharing controls.

## Checks

- `pnpm lint -- src/components/challenge-roulette.tsx src/app/random/page.tsx src/app/globals.css` passed with the existing CSS ignored-file warning only.
- `pnpm build` passed.
- `pnpm deploy:prod` passed, including `pnpm quest:release-gate` and production deploy guard.

## Deploy

- Commit: `3463f6a` (`Polish random quest chooser UX`)
- Production deploy: `https://cc-6k22pjsfj-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/random?randomChooserSmoke=20260611` returned 200 content with `Next step`, `Rule preview`, and `Start this Solo quest`.
- `https://cc-6k22pjsfj-andreas-nordenadlers-projects.vercel.app/random?randomChooserSmoke=20260611` returned the same expected random chooser content.
- `https://sidequestchess.com/challenges` returned 200 with existing `Official Solo finder` content.
- `https://sidequestchess.com/groupquests/public` returned 200 with existing `Find a table`, `Rule preview`, and `Next step` content.
