# SQC Web Invite Language Polish — 2026-06-11

Sprint: `sqc-website-ux-parity-review-24h`  
Window: 2026-06-10 20:18 → 2026-06-11 20:18 Europe/Stockholm

## User-facing change

Continued the SQC website UX parity sprint by polishing invite/share language on public standalone routes:

- `/share-kit` no longer frames sharing as a product-spread/internal growth surface; it now tells players to pick a Side Quest, copy the invite, and send the same rules/reward/coat/proof path.
- `/dare/[id]` removes page-review phrasing from the friend-quest quickstart and labels the account CTA as `Open My Side Quests` instead of the colder `Open checker`.
- `/verifiers` metadata and shared verifier labels no longer expose `next adapter`, `product-ready`, or `product contract` wording; pending states are described as planned checkers/rule promises.

No verifier behavior, quest release state, invite routing, or proof persistence changed.

## Checks

- `pnpm lint -- src/app/share-kit/page.tsx 'src/app/dare/[id]/page.tsx' src/app/verifiers/page.tsx src/lib/verifier-status.ts` — passed.
- `pnpm build` — passed.
- `pnpm deploy:prod` — passed, including `pnpm quest:release-gate` and production deploy guard.

## Commit / deploy

- Commit: `78ad7c3` — `Polish SQC invite language`
- Production deploy: `https://cc-7xiwebs4k-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/share-kit?inviteLanguageSmoke=20260611` — 200, contains new share-kit invite copy and old product-spread phrasing absent.
- `https://sidequestchess.com/dare/queen-never-heard-of-her?inviteLanguageSmoke=20260611` — 200, contains friend-quest quickstart copy and old `This invite page now...` phrase absent.
- `https://sidequestchess.com/verifiers?inviteLanguageSmoke=20260611` — 200, contains checker-status copy and old `next adapters` / product-contract phrasing absent.
- `https://cc-7xiwebs4k-andreas-nordenadlers-projects.vercel.app/share-kit?inviteLanguageSmoke=20260611` — 200 with new invite language.
