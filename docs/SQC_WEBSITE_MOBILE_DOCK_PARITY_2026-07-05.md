# SQC website/mobile dock parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were not touched.

## Parity matrix

| Mobile destination | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Home | bottom tab `Home`, hamburger `Home` | `/` plus phone-width dock tab | Improved |
| Solo Side Quests | bottom tab `Side Quests`, hamburger `Solo Side Quests` | `/solo` plus phone-width dock tab | Improved |
| Multiplayer Side Quests | bottom tab `Multiplayer Side Quests` | `/multiplayer` plus phone-width dock tab | Improved |
| Trophy Cabinet | bottom tab `Trophy Cabinet` | `/trophy-cabinet` plus phone-width dock tab | Improved |
| Account | bottom tab `Account`, hamburger `My Account` / `Sign in / Account` | `/account` or `/sign-in` plus phone-width dock tab | Improved |
| Custom / Community / Create / Support | mobile hamburger and in-screen intents | Existing top nav, account/settings shortcut grids, and route aliases | Covered |

## Implemented proof

- Added a mobile-only fixed dock to the shared website nav with the same five primary tabs as the native app: Home, Solo, Multiplayer, Trophy, Account.
- Kept desktop/tablet web navigation unchanged; the dock appears only at phone width.
- Reused existing website aliases and assets so the dock does not introduce new route behavior or mobile-app changes.
- Added bottom safe-area padding on phone-width pages so the dock does not cover page content.

## Verification

- `pnpm lint -- src/components/site-nav.tsx src/app/globals.css` passed with the pre-existing nav-logo `<img>` warning and a CSS ignored warning.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot capture was attempted against `http://127.0.0.1:3021/`, but local rendering was blocked by the existing Clerk key infinite redirect loop before `.site-nav` appeared. No screenshot artifact was produced for this slice.

## Remaining gaps

- The website still uses full page routes for Custom, Community, Support, and Create flows while mobile opens them through shell state and hamburger intents.
- Capture desktop and phone-width screenshots after the local Clerk key mismatch is resolved or a screenshot-safe anonymous environment is available.
