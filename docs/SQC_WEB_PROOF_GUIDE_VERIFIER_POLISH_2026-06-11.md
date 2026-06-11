# SQC Web Proof Guide + Verifier Board Polish — 2026-06-11

Sprint: `sqc-website-ux-parity-review-24h`  
Window: 2026-06-10 20:18 → 2026-06-11 20:18 Europe/Stockholm

## User-facing change

Continued the SQC website UX parity sprint by polishing the proof-guide surfaces that runners use before choosing a quest:

- `/rules` now explains proof as player-facing choices: `Fastest check`, `Specific game`, and `Honest receipt` instead of roadmap/adapter/internal product language.
- `/verifiers` now has a guided `How to use this board` panel, removes the duplicate account CTA, and frames each quest card with a clear `What SQC checks` receipt note plus `Open quest` next step.
- `/path` removes visible internal product-review phrasing from the onboarding picks section.

No verifier behavior, quest release state, or proof persistence changed.

## Checks

- `pnpm lint -- src/app/rules/page.tsx src/app/verifiers/page.tsx src/app/path/page.tsx src/app/globals.css` — passed with the known ignored-file warning for CSS.
- `pnpm build` — passed.
- `pnpm lint -- src/app/rules/page.tsx src/app/verifiers/page.tsx src/app/path/page.tsx` — passed after final copy tweak.
- `pnpm deploy:prod` — passed, including `pnpm quest:release-gate` and production deploy guard.

## Commit / deploy

- Commit: `8947c6b` — `Polish proof guide verifier UX`
- Production deploy: `https://cc-87tykfut7-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/verifiers?verifierGuideSmoke=20260611` — 200, contains `How to use this board` / `What SQC checks`, old `public rule contract` copy absent.
- `https://sidequestchess.com/rules?proofChoicesSmoke=20260611` — 200, contains `Proof choices`, old `Verifier roadmap` / `Product contract` copy absent.
- `https://sidequestchess.com/path?pathLanguageSmoke=20260611` — 200, contains `Think of it as a smart chess friend`, old internal product phrasing absent.
- `https://cc-87tykfut7-andreas-nordenadlers-projects.vercel.app/verifiers?verifierGuideSmoke=20260611` — 200 with the new verifier-guide copy.
