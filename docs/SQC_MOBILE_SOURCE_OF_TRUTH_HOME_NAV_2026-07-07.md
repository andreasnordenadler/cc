# SQC Mobile Source Of Truth - Home And Navigation - 2026-07-07

## Source Inspected

- `apps/mobile/App.tsx` current branch `sqc-mobile-app-web-rebuild-clean`.
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

- Bottom navigation:
  - The `TABS` array still exists in source, but the current `MobileShell` render does not output a persistent bottom tab bar.
  - The current navigation model is hamburger menu plus full-screen tab state/close behavior, not a persistent bottom dock.

- Brand/logo treatment:
  - The visible signed-out home uses the text title `Side Quest Chess` and the mobile `sqc-coat-of-arms.png` with `sqc-coat-generic-glow.png`.
  - Old web topbar logo files and the old public logo treatment were not treated as visible source of truth for this slice.

## First Web Slice Decision

The first clean web slice replaced the root shell baseline only. It removed the stale topbar logo/persistent bottom dock from the clean preview root and translated the mobile signed-out/signed-in home header, menu availability, Coat of Arms hero, active Solo, active Multiplayer, and Trophy Cabinet summary structure to browser constraints.
