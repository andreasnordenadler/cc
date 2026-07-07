# SQC Mobile Source Of Truth - Home And Navigation - 2026-07-07

## Source Read

- `apps/mobile/App.tsx`
- `ROADMAP.md` active item for the 2026-07-07 mobile-app web rebuild restart
- `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md`

## Current Visible Mobile Model

- Home route: `ActiveScreen` renders `TodayDashboard` for `activeTab === "home"`.
- Signed-out home:
  - Centered text header: `Side Quest Chess`.
  - Generic coat-of-arms art with soft glow.
  - Centered sign-in panel with `Sign in to continue.`
  - Body copy: `Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first; sign in when you want SQC to save progress, verify proof, or join a table.`
  - Primary actions inside the panel: `Browse Solo Side Quests`, `Browse Multiplayer Side Quests`, `Choose sign-in method`.
  - No hamburger menu.
  - No persistent bottom navigation.
  - No old public logo or wordmark treatment.

- Signed-in home:
  - Floating hamburger at the top left, rendered only for authenticated accounts by `GlobalHamburgerMenu`.
  - Centered identity block with display name and connected chess usernames.
  - Round account/avatar control at the top right.
  - If no chess account is connected, a `Connect a chess username` blocker appears.
  - Active Solo panel uses soft coat art, `Active Solo Side Quest` pill, active/empty state copy, refresh affordance, and `Explore More Solo Side Quests` when appropriate.
  - Active Multiplayer panel uses the multiplayer seal, `Active Multiplayer Side Quests` pill, empty/active rows, and `Explore More Multiplayer Side Quests`.
  - Trophy Cabinet panel uses soft coat art and Trophy Cabinet state rows.
  - Pull-to-refresh hint is visible between the active Solo and lower sections.
  - No persistent bottom navigation is currently rendered. `BottomNav` and `TABS` still exist in code, but `MobileShell` does not render `BottomNav`.

## Navigation Menu

`GlobalHamburgerMenu` menu labels in current mobile source:

- Home
- Solo Side Quests
- Multiplayer Side Quests
- Trophy Cabinet
- My Custom Side Quests
- Create Custom Side Quest
- Create Multiplayer Side Quest
- My Account / Sign in / Account
- Help & Support

## Web Rebuild Gate

For the current root slice, the web must look like the compact mobile app translated to browser constraints:

- Use text title and current mobile coat/seal assets for root app identity.
- Do not use old public logo/wordmark/topbar branding for the root shell or auth chrome.
- Do not add persistent bottom navigation unless a later mobile capture proves it is visible again.
- Keep signed-out root focused on the mobile sign-in panel; do not append old-web browse/card sections below it.
