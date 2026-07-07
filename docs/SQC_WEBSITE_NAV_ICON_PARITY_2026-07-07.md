# SQC website nav icon parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `TABS` and `GlobalHamburgerMenu`.

## Change

- Replaced the web hamburger drawer's two-letter placeholder glyphs with app-like inline SVG symbols for Home, Solo Side Quests, Multiplayer Side Quests, Official Leaderboards, Trophy Cabinet, custom/create actions, Account, Help & Support, and Settings.
- Replaced the bottom dock's `MP` and signed-in/out text placeholders with app-like Multiplayer and Account icons while preserving the existing mobile app image assets for Home, Side Quests, and Trophy Cabinet.
- Kept the mobile labels, tab order, companion-screen routes, active-state logic, auth behavior, and page APIs unchanged.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- Static checks confirmed `src/components/site-nav.tsx` now renders `NavIcon` inside `.mobile-app-menu-glyph` and `.mobile-tab-icon`, with CSS sizing for both SVG icon targets.
- Local screenshot attempt was blocked before render by Clerk middleware in this environment: `curl -I http://127.0.0.1:3017/side-quests` returned `HTTP/1.1 500 Internal Server Error` with `x-clerk-auth-reason: dev-browser-missing`, and Playwright found no menu `summary` because the page body was only `Internal Server Error`.

## Notes

- This slice intentionally avoids changing Clerk, middleware, account state, proof checks, or route behavior.
- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
