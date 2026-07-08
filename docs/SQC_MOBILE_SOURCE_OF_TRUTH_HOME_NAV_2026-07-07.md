# SQC Mobile Source Of Truth: Home, Header, Menu, Navigation

Date: 2026-07-07

Run refresh: 2026-07-08

Cron verification refresh: 2026-07-08 00:53 Europe/Stockholm

Autonomous sprint refresh: 2026-07-08 03:53 Europe/Stockholm

Purpose: capture the current mobile app home/navigation model before any clean web rebuild slices. The mobile app is the visible UI/product template; old web chrome, public logo treatment, and old website navigation remain suspect unless this file proves otherwise from current mobile source.

## Source Inspected

- `apps/mobile/App.tsx`
- Render shell: `SafeAreaView` / `ScrollView` / `ActiveScreen` path at lines 1713-1785.
- Signed-out home: `ActiveScreen` signed-out branch at lines 2152-2178.
- Signed-in home header and body: signed-in branch at lines 2181-2460.
- Signed-in global menu: `GlobalHamburgerMenu` at lines 1802-1848.
- Close control for non-home screens: `FixedScreenCloseButton` at lines 1791-1799.
- Stale/dead-code caution: `BottomNav` still exists at lines 6395-6427, but `grep -n "<BottomNav\\|BottomNav(" apps/mobile/App.tsx` returned only the function definition, so it is not mounted in the active render path.
- 2026-07-08 recheck: `rg -n "BottomNav\\(" apps/mobile/App.tsx` still returns only the function definition, and the active `MobileShell` render path still mounts `GlobalHamburgerMenu` only for authenticated accounts.
- 2026-07-08 cron recheck: `grep -n "<BottomNav\\|BottomNav(" apps/mobile/App.tsx` returned only the dormant function definition. Active render still mounts `GlobalHamburgerMenu` only under `isAuthenticatedAccount(displayAccount)`, so a persistent bottom dock is explicitly excluded from current web UI.
- 2026-07-08 03:53 autonomous recheck: active shell still renders `SafeAreaView` / `ScrollView` / `ActiveScreen` at lines 1713-1771, non-home close at lines 1775-1780, and signed-in-only `GlobalHamburgerMenu` at lines 1782-1784. `grep -n "<BottomNav\\|BottomNav(" apps/mobile/App.tsx` returned only `6395:function BottomNav(...)`; do not rebuild a persistent web bottom dock from that dormant function.

## 2026-07-08 Cron Checklist

- Home/header source of truth: `apps/mobile/App.tsx` active `MobileShell` render path, not old web preview HTML and not dormant `TABS` / `BottomNav` definitions.
- Signed-out source of truth: centered `Side Quest Chess` header, current coat-of-arms plus glow, `Sign in to continue.`, browse Solo/Multiplayer actions, and `Choose sign-in method`; no hamburger, account dot, old logo header, or bottom nav.
- Signed-in source of truth: global circular hamburger on the left, centered identity/chess usernames, account/avatar circle on the right, no visible wordmark/logo in the header, home sections ordered Active Solo, refresh hint, Active Multiplayer, Trophy Cabinet, refresh hint.
- Menu source of truth: Home, Solo Side Quests, Multiplayer Side Quests, Trophy Cabinet, My Custom Side Quests, Create Custom Side Quest, Create Multiplayer Side Quest, My Account, Help & Support.
- Non-home source of truth: fixed circular close button to return home; no persistent tab dock.
- Current preview mismatch: `https://cc-knpvy8h8y-andreas-nordenadlers-projects.vercel.app` returned HTTP 200 but still served stale `mobile-web-app-shell`, `mobile-web-topbar`, old `sqc-logo-v11` / `sqc-alt-logo-topbar` visible logo treatment, and `mobile-web-tab-dock`. That preview is not an acceptable product template for new slices.
- 2026-07-08 03:53 preview mismatch persists: HTTP 200, but HTML still contains `site-nav`, `mobile-app-menu`, `mobile-web-tab-dock`, `sqc-logo-v11`, and `sqc-alt-logo-topbar` markers. Replace that deployed baseline with a fresh preview from this clean branch before judging the rebuilt web shell.

## Current Mobile Home Model

### Signed Out

- Header is centered text only: `Side Quest Chess`.
- No hamburger menu is rendered for signed-out users.
- No account/profile circle is rendered for signed-out users.
- The first visible brand art is the current generic coat-of-arms with soft glow.
- Source lines: `apps/mobile/App.tsx` 2152-2178.
- 2026-07-08 03:53 line check: signed-out source is still `apps/mobile/App.tsx` 2152-2178.
- Primary home panel copy:
  - `Sign in to continue.`
  - `Chess, but with stupidly hard side quests - solo or multiplayer. Browse the live boards first; sign in when you want SQC to save progress, verify proof, or join a table.`
- Signed-out primary actions:
  - `Browse Solo Side Quests`
  - `Browse Multiplayer Side Quests`
  - `Choose sign-in method`
- Web implementation note for 2026-07-08: the signed-out root `Choose sign-in method` CTA now links directly to `/sign-in`, matching the mobile `handleSignIn` action instead of detouring through the account companion route.

### Signed In

- Header has no visible wordmark/logo.
- Left navigation is a circular hamburger button, rendered globally only when authenticated.
- Center identity shows display name plus connected `lichess` / `chess.com` usernames.
- Right navigation is a circular profile/avatar/account button.
- If a chess username is missing, a blocker panel appears: `Connect a chess username`.
- Main home sections, in order:
  - Active Solo Side Quest
  - Pull down to refresh hint
  - Active Multiplayer Side Quests
  - Trophy Cabinet
  - Pull down to refresh hint
- Source lines: `apps/mobile/App.tsx` 2181-2460.
- 2026-07-08 03:53 line check: signed-in source is still `apps/mobile/App.tsx` 2181-2451 for the root home stack through the second pull-refresh hint.

### Signed-In Menu

Menu items in current mobile order:

1. Home
2. Solo Side Quests
3. Multiplayer Side Quests
4. Trophy Cabinet
5. My Custom Side Quests
6. Create Custom Side Quest
7. Create Multiplayer Side Quest
8. My Account
9. Help & Support

Menu behavior:

- Opens from the circular hamburger.
- Uses an overlay/backdrop.
- Shows item icons and labels.
- Selected item gets active styling.
- Menu closes after a selection.
- Source lines: `apps/mobile/App.tsx` 1802-1848.
- 2026-07-08 03:53 line check: menu order/source is still `apps/mobile/App.tsx` 1802-1828.

### Non-Home Screen Navigation

- Non-home screens use a fixed circular close button near the top right.
- The close button returns to home.
- Current active render path does not mount a persistent bottom navigation bar.
- The old-looking bottom navigation code remains in the file, but because it is not mounted, it must not be used as web source of truth.
- Source lines: `apps/mobile/App.tsx` 1775-1783, 1791-1799, and 6395-6427.
- 2026-07-08 03:53 line check: active non-home close source is `apps/mobile/App.tsx` 1775-1780 and 1791-1799; dormant `BottomNav` remains at 6395 onward.

## Web Rebuild Checklist For Root/Home Slices

- Signed-out web root should not show old website navbar/chrome.
- Signed-out web root should not show a hamburger or persistent nav.
- Signed-out web root may show centered `Side Quest Chess` text plus current coat/glow art and the three current actions.
- Signed-in web root should use the hamburger/center identity/profile-circle header model.
- Signed-in web root should preserve the current menu item order above.
- Web should not add persistent bottom navigation unless a fresh mobile app capture proves the active mobile render path mounts one.
- Public logo art should not be used as a primary header/brand mark. The only current active logo-like usage is a very faint mobile background watermark; visible product identity is text/coat/header controls.
- Old web route composition, old nav bars, and old logo treatment should remain excluded from visible UI decisions.

## Current Clean Preview Mismatch Notes

- The clean web shell already follows the current mobile direction for the root: no signed-out nav, signed-in hamburger/header/profile model, and no persistent bottom nav.
- The provided preview URL was still serving an older deployed baseline during the 2026-07-08 recheck; its HTML contained `site-nav` / `mobile-app-menu` markers plus old `sqc-logo` asset references. That preview should be replaced by a fresh preview deploy from this clean branch before judging the rebuilt shell.
- Remaining risk for later slices: the web component must keep using this current mobile source checklist instead of older preview screenshots or dormant mobile `BottomNav` code.
