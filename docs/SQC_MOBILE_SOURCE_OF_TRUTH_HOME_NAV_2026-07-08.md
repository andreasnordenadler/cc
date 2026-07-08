# SQC Mobile Source Of Truth: Home And Navigation - 2026-07-08

## Sources Checked

- `apps/mobile/App.tsx`, `MobileShell`
- `apps/mobile/App.tsx`, `GlobalHamburgerMenu`
- `apps/mobile/App.tsx`, signed-out and signed-in home branch around the current active Solo / Multiplayer / Trophy dashboard
- `apps/mobile/App.tsx`, `BottomNav`
- `ROADMAP.md`, active 2026-07-07 SQC mobile-app web rebuild restart item
- `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md`

## Current Home / Navigation Checklist

- Root screen starts at `activeTab: "home"` inside `MobileShell`.
- Signed-out home does not render `GlobalHamburgerMenu`; it shows centered `Side Quest Chess`, current coat-of-arms art with generic glow, browse buttons for Solo and Multiplayer, and `Choose sign-in method`.
- Signed-in home renders a floating round hamburger at the top-left and a round account/avatar button at the top-right.
- Signed-in identity is centered between those controls and shows display name plus connected `lichess` / `chess.com` usernames when present.
- `GlobalHamburgerMenu` items, in order: `Home`, `Solo Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `My Custom Side Quests`, `Create Custom Side Quest`, `Create Multiplayer Side Quest`, `My Account` / `Sign in / Account`, `Help & Support`.
- Non-home app screens render a fixed round close button back to Home.
- Persistent bottom navigation is not current. `BottomNav` exists in source, but no `<BottomNav />` render call exists in `apps/mobile/App.tsx`.
- The current mobile visible brand treatment is the coat-of-arms / seal artwork with glow, not the older public wordmark/logo files.
- Signed-in home sections are: optional chess-username blocker, active Solo Side Quest card, pull-to-refresh hint, active Multiplayer Side Quests section, Trophy Cabinet section, and final pull-to-refresh hint.
- Active Solo card shows a refresh icon button, `Active Solo Side Quest` pill, current active title when present or `Choose a Solo Side Quest`, proof-state summary, and `Explore More Solo Side Quests` / `Pick your next Solo Side Quest`.

## Web Translation Gate For This Slice

- Root web must not introduce old `SiteNav` chrome, old public logo treatment, or a persistent bottom nav.
- Root signed-out web should mirror the signed-out mobile structure: title, coat glow/art, browse Solo, browse Multiplayer, sign-in method.
- Root signed-in web should mirror the signed-in mobile dashboard structure and labels, using web links only as route-compatible replacements for mobile tab actions.
