# SQC Mobile Source Of Truth - Home And Navigation - 2026-07-07

Purpose: first gate for the clean web rebuild sprint. The current mobile app is the only visible UI/product template. Old web chrome, old public logo treatments, and stale source references are suspect unless this checklist proves them current.

## Inspected Sources

- Sprint brief: `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md`
- Active roadmap item: `ROADMAP.md`, "2026-07-07 SQC mobile-app web rebuild sprint restart"
- Current mobile app implementation: `apps/mobile/App.tsx`
- Relevant source lines captured with `nl -ba apps/mobile/App.tsx` during this run:
  - App shell render and global controls: lines 1713-1785
  - Global hamburger menu: lines 1802-1848
  - Signed-out home: lines 2152-2178
  - Signed-in header and Solo section: lines 2181-2248
  - Signed-in Multiplayer and Trophy sections: lines 2300-2448
  - Dead `BottomNav` definition: lines 6395-6428; no `<BottomNav` call site exists

## Current Mobile Home Model

### Signed Out

- Header is centered text: `Side Quest Chess`.
- No hamburger/menu is rendered for signed-out users from the app shell; the global hamburger is gated by `isAuthenticatedAccount(displayAccount)`.
- Brand treatment is the coat of arms artwork with generic glow, not the old website logo/nav composition.
- Primary panel copy:
  - `Sign in to continue.`
  - `Chess, but with stupidly hard side quests - solo or multiplayer. Browse the live boards first; sign in when you want SQC to save progress, verify proof, or join a table.`
- Primary actions:
  - `Browse Solo Side Quests`
  - `Browse Multiplayer Side Quests`
  - `Choose sign-in method`
- Source lines: `apps/mobile/App.tsx` 2152-2178.

### Signed In

- Header is a compact app identity row, not a public website masthead.
- The identity block is centered and shows the app account name plus connected Lichess/Chess.com usernames.
- The account avatar/dot sits on the right and opens account settings.
- The floating global hamburger is rendered separately by the shell for authenticated users and sits at the left.
- If no chess username is connected, a blocker panel appears: `Connect a chess username` / `SQC needs Lichess or Chess.com before it can check real games.`
- Source lines: `apps/mobile/App.tsx` 2181-2204.

## Current Mobile Navigation Model

- Current app navigation is a floating global hamburger for authenticated users.
- The hamburger menu button has accessibility labels `Open main menu` / `Close main menu`.
- Menu entries, in order:
  1. `Home`
  2. `Solo Side Quests`
  3. `Multiplayer Side Quests`
  4. `Trophy Cabinet`
  5. `My Custom Side Quests`
  6. `Create Custom Side Quest`
  7. `Create Multiplayer Side Quest`
  8. `My Account` when authenticated, otherwise `Sign in / Account`
  9. `Help & Support`
- Non-home screens get a fixed round close button returning to home.
- Source lines: `apps/mobile/App.tsx` 1775-1783 and 1802-1848.

## Bottom Navigation Verdict

- Do not build persistent bottom navigation for the web rebuild.
- `BottomNav` still exists in `apps/mobile/App.tsx`, but inspection found no `<BottomNav` call site.
- The currently rendered shell uses the floating hamburger plus close button model instead.
- Treat bottom-nav styling, icons, and old tab assumptions as stale/dead-code evidence unless a later mobile capture proves otherwise.
- Source lines: `apps/mobile/App.tsx` 6395-6428, plus `grep -n "<BottomNav\\|BottomNav(" apps/mobile/App.tsx` returned only the function definition.

## Brand / Logo Verdict

- Do not preserve the old public website logo treatment.
- The current signed-out mobile surface uses `Side Quest Chess` text plus the coat-of-arms artwork with the generic glow.
- The app shell still renders a faint `/sqc-logo-v11.png` watermark behind content, but the visible first-screen signed-out brand is not an old website masthead or nav logo.
- Rebuild web brand surfaces from the coat/glow + compact app identity model; avoid old website chrome unless a current mobile state explicitly shows it.
- Source lines: `apps/mobile/App.tsx` 1717-1719 and 2155-2164.

## Root Web Slice Checklist For Next Run

- Signed-out root should have no hamburger and no persistent bottom nav.
- Signed-out root should use centered `Side Quest Chess`, coat-of-arms + glow, browse Solo/Multiplayer actions, and sign-in CTA.
- Signed-in root should use the left floating hamburger, centered identity, right account dot, and stacked app sections:
  - Active Solo Side Quest
  - Active Multiplayer Side Quests
  - Trophy Cabinet
- Non-home routes should use the fixed close-to-home affordance, not an old website nav bar.
- Any visible use of old website header/nav/logo composition is a mismatch and should stop the slice before commit.
