# SQC Mobile Source Of Truth - Home And Navigation - 2026-07-07

## Source Inspected

- `apps/mobile/App.tsx` current branch `sqc-mobile-app-web-rebuild-clean`.
- Visual capture: `artifacts/web-rebuild/root-mobile-source-slice-2026-07-07.png`.
- Relevant implementation:
  - `MobileShell` renders the app backdrop, scroll view, optional close button, and `GlobalHamburgerMenu` only for authenticated accounts.
  - `GlobalHamburgerMenu` defines the current main menu entries and selected states.
  - `TodayDashboard` defines signed-out home, signed-in home header, active Solo, active Multiplayer, and Trophy Cabinet summaries.

## Current Mobile Home Checklist

- Signed-out home:
  - No hamburger menu.
  - No account/avatar dot in the top row.
  - Centered text title `Side Quest Chess`.
  - Large generic Coat of Arms with the generic glow asset.
  - Centered panel with `Sign in to continue.`
  - Browse actions for Solo and Multiplayer before sign-in.
  - Primary action text is `Choose sign-in method`.

- Signed-in home:
  - Hamburger menu is a floating 40px circular control at the left.
  - Header identity is centered between the hamburger and profile/avatar control.
  - Account/avatar control is a 40px circular control at the right.
  - Header identity shows display name plus connected Lichess/Chess.com account names.
  - A `Connect a chess username` blocker appears when no chess username is connected.

- Main menu:
  - Present only for authenticated accounts in the current home shell.
  - Items are `Home`, `Solo Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `My Custom Side Quests`, `Create Custom Side Quest`, `Create Multiplayer Side Quest`, `My Account` or `Sign in / Account`, and `Help & Support`.
  - `Community Side Quests`, `Official Leaderboards`, and `Settings` are reachable product routes, but they are not in the current mobile hamburger menu source for this home/navigation slice.

- Bottom navigation:
  - The `TABS` array still exists in source, but the current `MobileShell` render does not output a persistent bottom tab bar.
  - The current navigation model is hamburger menu plus full-screen tab state/close behavior, not a persistent bottom dock.

- Brand/logo treatment:
  - The visible signed-out home uses the text title `Side Quest Chess` and the mobile `sqc-coat-of-arms.png` with `sqc-coat-generic-glow.png`.
  - The current mobile shell still contains a very faint background watermark from `/sqc-logo-v11.png`, but old web topbar logo files and old public logo treatments are not visible source of truth for root home rows or navigation.

## First Web Slice Decision

The first clean web slice replaced the root shell baseline only. It removed the stale topbar logo/persistent bottom dock from the clean preview root and translated the mobile signed-out/signed-in home header, menu availability, Coat of Arms hero, active Solo, active Multiplayer, and Trophy Cabinet summary structure to browser constraints.

## 2026-07-07 Follow-Up Root Baseline Tightening

- Removed stale root-menu entries that are not present in the current mobile hamburger menu for this source state: `Community Side Quests`, `Official Leaderboards`, and `Settings`.
- Changed the signed-in account menu label to `My Account`, matching the authenticated mobile menu label.
- Pointed `My Custom Side Quests` at the existing route-compatible `/custom-side-quests` web route.
- Replaced old public/topbar logo row art in the root Solo/account rows with the verified mobile Coat of Arms source asset.
