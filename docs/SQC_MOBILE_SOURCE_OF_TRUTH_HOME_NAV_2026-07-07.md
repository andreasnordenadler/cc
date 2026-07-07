# SQC Mobile Source Of Truth - Home And Navigation - 2026-07-07

This checklist is the first gate for the clean web rebuild sprint. The visible web shell must follow the current mobile app, not the old website.

## Verified Source

- `apps/mobile/App.tsx` rendered shell path: `MobileShell`, `TodayDashboard`, `GlobalHamburgerMenu`, and `FixedScreenCloseButton`.
- Asset parity spot-check: web `public/mobile-source` coat/glow/multiplayer seal files match the current mobile asset hashes exactly.
- Next.js implementation note: App Router pages/components remain server components unless interactivity requires a client boundary.

## Source Inspected

- `apps/mobile/App.tsx`
- Current home screen: `TodayDashboard`
- Current app shell/navigation: `MobileShell`, `GlobalHamburgerMenu`, `FixedScreenCloseButton`
- Older `TABS` metadata and older bottom navigation implementations may be present in source but are not rendered by `ActiveScreen` / `MobileShell`; do not use them as visible web source.

## Current Mobile Model

- Signed-out home has no hamburger, no bottom navigation, and no public wordmark logo treatment. It shows centered `Side Quest Chess`, the coat of arms over the generic glow, browse actions for Solo and Multiplayer, and the primary `Choose sign-in method` action.
- Signed-in home has a floating circular hamburger at top left, centered account identity, and a circular account/avatar control at top right.
- Current mobile navigation is the global hamburger menu, rendered as a modal overlay with dim backdrop and a compact brown panel. It contains `Home`, `Solo Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `My Custom Side Quests`, `Create Custom Side Quest`, `Create Multiplayer Side Quest`, `My Account` / `Sign in / Account`, and `Help & Support`.
- The current mobile app does not render persistent bottom navigation. Older `TABS` metadata exists in source but is not the current visible navigation model.
- Non-home app states use a floating circular close button that returns to home.

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
- Persistent bottom navigation is not rendered by `MobileShell`; existing bottom-nav source is stale for this sprint unless the current app starts rendering it again.

## Web Rebuild Checklist For Root Shell

- Keep old website chrome out of the root shell.
- Do not add persistent bottom navigation.
- Do not use old public logo or wordmark treatments for the root header.
- Keep mobile-source assets only where they are verified copies of current mobile assets.
- Translate the hamburger to browser constraints as the same floating control plus overlay menu, not as a desktop navbar.
- A web slice fails the gate if it looks like the old website with app-like parts instead of this current mobile app model translated to browser constraints.

## Baseline Preview Mismatch Found

Preview checked: `https://cc-knpvy8h8y-andreas-nordenadlers-projects.vercel.app`

- HTTP status: 200.
- DOM/screenshot proof captured locally at `artifacts/sqc-mobile-web-clean-current-preview-home.png`.
- Mismatch: the preview still shows old public logo images and a persistent bottom tab bar.
- Next action: deploy a fresh preview from `sqc-mobile-app-web-rebuild-clean`, whose local root shell removes that stale bottom-nav/logo baseline.
