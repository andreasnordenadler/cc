# SQC Mobile Multiplayer Hub + Official Leaderboard Plan

Date: 2026-05-27
Owner: Sam

## Recommendation

Keep the overall Home screen layout as-is, but change the navigation intent:

1. **User-generated Multiplayer Side Quests** should use a Home entry labeled `Browse`, replacing the current `Create` entry.
2. `Browse` should open a dedicated user-generated multiplayer dashboard/hub/list/search/manage screen.
3. **Create** should still exist, but inside that Browse hub rather than as the main Home affordance.
4. **Official Multiplayer Side Quests** should get a matching Home entry labeled `Leaderboard`.
5. `Leaderboard` should open a dedicated official weekly leaderboard/archive hub.

This keeps Home stable while making the two multiplayer lanes clearer: community discovery/management on one side, official competition/results on the other.

## Why

The current flow is functionally close, but the Home actions point at the wrong level:
- `Create` sends users directly into a single action instead of the broader user-generated multiplayer world
- public/community rooms need browse, search, join, create, and management in one place
- official events need stronger identity than ordinary public rooms
- official leaderboards/results are recurring weekly content, so they deserve a first-class archive rather than being hidden inside individual room detail screens

## Proposed Hub Structure

### Home entry
- In the existing Home layout, replace the user-generated multiplayer action label `Create` with `Browse`.
- `Browse` opens this hub.

### Top area
- Title: `Browse Multiplayer Side Quests`
- Primary utility: search/filter public rooms
- Secondary utilities: `Create Multiplayer Side Quest`, `Join by private key`

### Section 1 — My Multiplayer Side Quests
- Hosted/joined rooms
- Show admin badge when host
- Show status, player count, time left, and current position when relevant
- Include management actions for hosted rooms where appropriate

### Section 2 — Public Multiplayer Side Quests
- Public user-created rooms
- Browsable/searchable list with room status and join affordance
- Sort defaults should favor active/joinable rooms first

### Section 3 — Private Join
- Paste invite key / open invite link flow
- Keep separate enough that private rooms do not visually compete with public discovery

## Official Leaderboards Screen

Official Multiplayer Side Quests should have a dedicated Home entry labeled `Leaderboard`, parallel to the community `Browse` entry.

## Official Leaderboards Model

### Home entry
- In the existing Home layout, add/use `Leaderboard` for Official Multiplayer Side Quests.
- `Leaderboard` opens this official weekly results hub.

### Current week
- Show leaderboards for the current 3 active Official Multiplayer Side Quests.
- The cadence is weekly: easy / medium / hard.
- Each card opens full leaderboard + rules + dates + included Side Quests.

### Previous week
- Show final results for the latest previous 3 finished Official Multiplayer Side Quests.
- Treat these as completed/podium/final-results cards rather than live rooms.

### Archive
- Browse older weekly sets of Official Multiplayer Side Quests.
- List weeks newest first.
- Tapping a week opens the 3 official results from that week.

## Product Rules

- Keep the overall Home screen layout stable.
- There should be **three active official events** each week: easy / medium / hard.
- The leaderboard screen should treat official SQC events as a first-class weekly competition/results surface, not just another generic multiplayer room list.
- Home `Create` should become `Browse` for user-generated Multiplayer Side Quests.
- Create belongs inside the Browse hub, not as the main Home-level user-generated multiplayer entry.

## Recommended Build Order

1. Preserve the current Home layout and rename the user-generated multiplayer Home action from `Create` to `Browse`.
2. Build the Browse hub: My Multiplayer, searchable public rooms, create action, private-key join, and hosted-room management.
3. Add the Official `Leaderboard` Home action/screen.
4. On the Leaderboard screen, show current 3 active official leaderboards and latest previous 3 final results.
5. Add weekly archive browsing for older official sets.
6. Add richer filters/sort only after the structure is solid.
