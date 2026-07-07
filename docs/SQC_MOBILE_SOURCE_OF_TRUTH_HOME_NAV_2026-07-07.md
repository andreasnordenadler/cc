# SQC Mobile Source Of Truth - Home And Navigation - 2026-07-07

This checklist is the first gate for the clean web rebuild sprint. The visible web shell must follow the current mobile app, not the old website.

## Source Inspected

- `apps/mobile/App.tsx`
- Current home screen: `TodayDashboard`
- Current app shell/navigation: `MobileShell`, `GlobalHamburgerMenu`, `FixedScreenCloseButton`
- Older `HomeScreen` and `BottomNav` implementations are present in source but are not rendered by `ActiveScreen` / `MobileShell`; do not use them as visible web source.

## Current Mobile Home: Signed Out

- Top identity: centered text title `Side Quest Chess`.
- Brand treatment: generic Coat of Arms artwork over the generic glow asset, not the old public wordmark/logo treatment.
- No hamburger menu while signed out.
- No persistent bottom navigation.
- Primary content: centered sign-in panel with:
  - `Sign in to continue.`
  - copy beginning `Chess, but with stupidly hard side quests`
  - actions for Solo browse, Multiplayer browse, and `Choose sign-in method`.

## Current Mobile Home: Signed In

- Top identity: centered account identity line between two fixed circular controls.
- Left control: circular hamburger menu.
- Right control: circular account/avatar button.
- Missing chess username state: blocker panel `Connect a chess username`.
- Home sections appear as stacked app panels:
  - Active Solo Side Quest
  - Pull down to refresh hint
  - Active Multiplayer Side Quests
  - Trophy Cabinet
- Brand/section art uses the current app Coat of Arms, generic glow, and Multiplayer seal assets in app panels.

## Current Mobile Navigation

- The rendered primary navigation is the hamburger menu, available only for authenticated accounts in the app shell.
- Menu items, in order:
  - Home
  - Solo Side Quests
  - Multiplayer Side Quests
  - Trophy Cabinet
  - My Custom Side Quests
  - Create Custom Side Quest
  - Create Multiplayer Side Quest
  - My Account / Sign in / Account
  - Help & Support
- Non-home screens use a fixed circular close button that returns to Home.
- Persistent bottom navigation is not rendered by `MobileShell`; existing `BottomNav` source is stale for this sprint unless the current app starts rendering it again.

## Web Translation Rules For This Sprint

- Do not preserve old website chrome, public wordmark lockups, old logo watermarks, or bottom tab bars.
- Use old web code only for auth, APIs, proof/data logic, route compatibility, and server-side plumbing.
- Current app assets that are verified acceptable for visible web shell:
  - `/mobile-source/sqc-coat-of-arms.png`
  - `/mobile-source/badges/glow/sqc-coat-generic-glow.png`
  - `/mobile-source/stamps/sqc-multiplayer-seal.png`
- A web slice fails the gate if it looks like the old website with app-like parts instead of this current mobile app model translated to browser constraints.

## Baseline Preview Mismatch Found

Preview checked: `https://cc-knpvy8h8y-andreas-nordenadlers-projects.vercel.app`

- HTTP status: 200.
- DOM/screenshot proof captured locally at `artifacts/sqc-mobile-web-clean-current-preview-home.png`.
- Mismatch: the preview still shows old public logo images and a persistent bottom tab bar.
- Next action: deploy a fresh preview from `sqc-mobile-app-web-rebuild-clean`, whose local root shell removes that stale bottom-nav/logo baseline.
