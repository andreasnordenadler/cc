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

## Current Run Verification

- 2026-07-07 cron run rechecked before editing: `git status --short --branch` was clean on `sqc-mobile-app-web-rebuild-clean`; `ROADMAP.md` active item and `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md` both require current mobile-app truth before visible web UI work.
- Rechecked current mobile shell source in `apps/mobile/App.tsx`: the rendered app shell still mounts `GlobalHamburgerMenu` only for authenticated accounts, uses `FixedScreenCloseButton` for non-home screens, and does not mount persistent bottom navigation.
- Rechecked root web baseline source: `src/components/mobile-app-web-shell.tsx` follows the mobile hamburger/header/close-screen model, while `src/app/globals.css` still carried a hidden old `/sqc-logo-v11.png` body watermark fallback. That stale global logo baseline was removed in this run.
- Asset hash proof: `apps/mobile/assets/sqc-coat-of-arms.png` matches `public/mobile-source/sqc-coat-of-arms.png` (`4d799eb4ca0152b7b551db26aca22786b0ca008d2a18816b172f53b105cd5119`); `apps/mobile/assets/badges/glow/sqc-coat-generic-glow.png` matches `public/mobile-source/badges/glow/sqc-coat-generic-glow.png` (`903a3de0e2abf264ea970e7e3b0f43ec54471af039134c285d6a1c8c3eaf2a4d`); `apps/mobile/assets/stamps/sqc-multiplayer-seal.png` matches `public/mobile-source/stamps/sqc-multiplayer-seal.png` (`36e1c6a33beaa7d67feffb5899f2e8ca4f8c82c5f344a5289a8a91470214fa17`).
- Rechecked source before the signed-in root-shell tightening slice: `apps/mobile/App.tsx` lines 1713-1784 render `MobileShell` with no `BottomNav` call; lines 1802-1848 render the authenticated hamburger menu; lines 2152-2448 render signed-out and signed-in home states.
- Rechecked identity/header details: `apps/mobile/App.tsx` lines 2181-2198 render the signed-in centered identity and right account circle; lines 3504-3524 render platform chips for `lichess` / `chess.com`; lines 10250-10280 define the 40px header controls, identity sizing, and brown hamburger menu panel.
- Rechecked home panel details: `apps/mobile/App.tsx` lines 2200-2261 render the missing-chess-account blocker, empty Solo panel, refresh affordance, and pull-to-refresh hint; lines 2303-2445 render Active Multiplayer and Trophy Cabinet panels.
- Asset hash proof remains current: `apps/mobile/assets/sqc-coat-of-arms.png`, `apps/mobile/assets/badges/glow/sqc-coat-generic-glow.png`, and `apps/mobile/assets/stamps/sqc-multiplayer-seal.png` match their `public/mobile-source/...` copies by SHA-256.

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
