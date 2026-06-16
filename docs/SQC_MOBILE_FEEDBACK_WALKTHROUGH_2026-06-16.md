# SQC Mobile Feedback Walkthrough — 2026-06-16

## Operating mode

Andreas is doing a focused screen-by-screen SQC Mobile App walkthrough.

Sam must:
- Respond to each feedback item with a concise understanding of what needs to be fixed.
- Queue the item here.
- Do **not** implement fixes until Andreas says he is ready with feedback for now.
- When implementation starts, apply the queued fixes systematically, verify, commit, push, and build a new APK if mobile code/assets changed.

## Queue

1. Start screen top-bar alignment
   - Hamburger menu circle and profile picture should be vertically aligned; current profile/avatar appears slightly higher than the hamburger circle.
   - Fix by adjusting mobile header/top-bar layout so both controls share the same centerline.

2. Community Side Quest background gradients
   - Keep the active Side Quest-driven background gradient behavior.
   - Ensure Community Side Quests also get varied background gradients instead of a generic/static look.
   - Add/use a palette of 40 distinct gradient/background color variants and assign them deterministically/randomly to community quests so different community quests feel visually distinct.

3. Hamburger menu labels and ordering
   - Rename menu item `Today` to `Home`.
   - Rename `Multiplayer Lobby` to `Multiplayer Side Quests`.
   - Rename `My SQC` to `My Account`.
   - Move `My Account` to be the second-last menu item.
   - Keep `My Custom Side Quests` unchanged for now.

4. Future custom-content hub reminder
   - Andreas wants a later new screen/hub for the user's custom content.
   - When Andreas says to start applying fixes, remind him that this larger custom-content hub is a separate future screen, not part of the immediate menu-label cleanup unless he wants it included.

5. Active quest detail screen spacing
   - This is the screen opened by tapping the active quest on the start/home screen.
   - Move the content upward to remove/reduce the large empty space above the Coat of Arms/badge artwork.
   - Goal: the screen should feel tighter and more intentional immediately after opening.

6. Active quest detail status/info presentation
   - Replace the current `Picked / What to do / Latest check` section on this detail screen.
   - Use the same presentation style/pattern as the start screen uses for this information, so the active quest summary feels consistent between Home and detail.

7. Active quest detail like button placement
   - Add the missing like button on this active quest detail screen.
   - Place it immediately to the right of the quest name/title.

8. Solo Side Quest screen close action
   - This is the Solo Side Quest screen as seen when SQC Official Side Quests are activated.
   - Add an `X` close button in the same top-right position/style as the active side quest detail screen.
   - Tapping `X` should take the user back to the Home screen.

9. Solo Side Quest screen coat spacing/scale
   - Make the SQC Coat of Arms larger on this screen.
   - Reduce the empty space above the Coat of Arms so the top of the screen feels less vacant.

10. Solo Side Quest type toggle copy
   - The two buttons/toggles are currently not ideal for explaining the two Side Quest types, but keep the structure for now.
   - Rename `Community Solo Side Quests` to `Community Side Quests`.
   - Rename `SQC Official Side Quests` to `Official Side Quests`.

11. Community Side Quest intro text rewrite
   - On the Solo Side Quest screen when the Community Side Quests tab/type is active, replace the entire explanatory text block that starts with `Community Solo...` and ends with `...from here.`
   - New copy should be simpler: explain only that these are Side Quests created by the Side Quest Chess community.
   - Also remove the separate text/headline `Discover Community...` from this view.

12. Community Side Quest list pagination
   - The Community Side Quest list may become very long.
   - Show only 10 Community Side Quests initially.
   - Add a `Load more` option that reveals/loads another 10 each time.

13. Community Side Quest action buttons cleanup
   - Remove the `Discover` and `My Custom` buttons from the Community Side Quests active view.
   - Replace them with one clearer action button: `Add/Create a New Side Quest`.

14. Remove Community Side Quest `#Discover`
   - Remove the `#Discover` label/tag from this Community Side Quest screen.

15. Multiplayer Side Quests screen close action
   - This screen is currently/previously called Multiplayer Lobby and should now be titled `Multiplayer Side Quests`.
   - Add an `X` close button to this screen as well, matching the close behavior/style used on the active side quest and Solo Side Quest screens.
   - Tapping `X` should return to Home.

16. Multiplayer Side Quests screen redesign direction
   - Redesign the Multiplayer Side Quests screen to look very similar to the Solo Side Quest screen, so the app structure feels consistent.
   - Use the same general hierarchy, spacing, hero/seal treatment, and list/card rhythm where appropriate.
   - Priority order on the screen: first show active joined/hosted Multiplayer Side Quests, then recently finished joined/hosted Multiplayer Side Quests, then available Multiplayer Side Quests to join.
   - Keep available-to-join quests lower priority than the user's own active/recent Multiplayer Side Quests.

## Implementation status — 2026-06-16

Implemented in the mobile walkthrough pass:
- Header/menu alignment adjusted: profile avatar now shares the hamburger centerline more closely.
- Community/custom Side Quests now receive deterministic visual palettes from a 40-color set.
- Hamburger/bottom labels updated: `Home`, `Multiplayer Side Quests`, `My Account`; My Account moved near the bottom while keeping `My Custom Side Quests`.
- Larger custom-content hub preserved as a future item; current create/custom routes remain reachable.
- Active Side Quest detail tightened upward, reuses Home-style status/proof summary blocks, and adds a like pill beside the title.
- Solo Side Quest catalog gained the top-right close X, larger coat artwork, and simpler Official/Community wording.
- Community Side Quest tab copy simplified, Discover/My Custom toggle removed from browse, `#Discover` removed from the main browse structure, and `Add/Create a New Side Quest` added.
- Community Side Quest browse now initially shows 10 quests with `Load more` in increments of 10.
- Multiplayer Side Quests gained the close X and was reordered to prioritize active joined/hosted quests, then recently finished quests, then available official/community quests.
