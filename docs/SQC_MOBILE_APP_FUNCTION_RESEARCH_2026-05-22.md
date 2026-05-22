# SQC Mobile App Function Research — 2026-05-22

## Trigger

Andreas corrected the mobile direction:

- `Live Board` is not a meaningful SQC product term.
- Native mobile must always use the **SQC website color scheme**.
- We are drifting away from what the app is for; stop pushing UI variants until the app functions are grounded.

## Non-negotiable design constraints

1. **Use website colors only**
   - `--bg #060507`
   - `--ink #fff7e8`
   - `--muted #c7bda9`
   - `--gold #f5c86a`
   - `--pink #ff5f9f`
   - `--green #60f0af`
   - `--blue #76a9ff`
   - `--orange #e87922`
   - `--danger #ff7a66`
   - Website panel tokens: `rgba(255,255,255,.075)`, `rgba(255,255,255,.12)`, `rgba(255,255,255,.15)`.
2. **Do not invent generic labels**
   - Avoid `Live Board`, `Quest Board`, `Tracker`, `Mission`, `Coats`.
   - Prefer precise SQC nouns: `Current Side Quest`, `My Multiplayer Side Quests`, `Official Multiplayer Side Quests`, `Coat of Arms`, `Proof`.
3. **Apple Sports is a functional reference, not a visual color palette**
   - Borrow speed, density, personalization, status-first layout, and deep-but-tappable detail.
   - Do not borrow blue colors if they conflict with SQC.

## Product foundation from SQC canon

Side Quest Chess is not chess training or a chess-playing app. It is: **Chess, but with stupidly hard side quests.**

The core loop is:

1. Pick a weird Side Quest.
2. Play real games on Lichess or Chess.com.
3. SQC checks recent public games.
4. User gets pass/fail proof.
5. User earns a Coat of Arms / points / shareable proof.
6. User tries another Side Quest or joins a Multiplayer Side Quest.

Mobile should not compete with the website as a marketing/product explainer. It should be the fastest way for an existing player to answer: **What should I do now, did it count, and what can I join next?**

## Apple Sports research summary

Apple’s own positioning for Apple Sports:

- Real-time scores and stats, fast and simple.
- Personalized home view from followed teams/leagues/tournaments.
- Real-time data and Live Activities.
- Game pages with box scores, play-by-play, team stats, lineups, betting odds where available.
- Quick navigation from today/upcoming/live games into detail.

Support/app-store source patterns to adapt:

| Apple Sports function | SQC equivalent |
| --- | --- |
| My Teams / followed leagues home | My active Solo + Multiplayer Side Quests |
| Live score/status rows | Current Side Quest status + Multiplayer Side Quest standings/progress |
| Upcoming games | Official Multiplayer Side Quests / scheduled Side Quests |
| Game detail page | Side Quest detail: rules, eligible provider/game types, current attempt state |
| Play-by-play | Check history / proof attempts / latest eligible games |
| Box score/team stats | Multiplayer leaderboard / participant progress / completed Side Quests |
| Live Activities/widget | Future: lock-screen current Side Quest status / check result |
| Search/follow teams/leagues | Browse/pick Side Quests + join official Multiplayer Side Quests |
| Open TV/news integrations | Open Lichess/Chess.com / share proof |

## Recommended app functions

### Tier 1 — launch-critical native app functions

These define what the app is for.

1. **Current Side Quest status**
   - Shows exactly one current Solo Side Quest if active.
   - Shows Coat of Arms as a compact identity marker.
   - Shows status: no active / in progress / completed / latest check failed / waiting for new eligible game.
   - Primary action: `Check` when active; `View proof` when completed; `Pick Side Quest` when none.

2. **Check latest games**
   - Native button calls the SQC verifier endpoint.
   - Must explain only if needed: “Play a new public game, then check.”
   - No `Live Board` language.

3. **My Multiplayer Side Quests**
   - Shows every active Multiplayer Side Quest the user hosts or joined.
   - Each row should show: title, status, participant count, user progress/score when available, and tap-to-detail.
   - Points can appear here because points matter most in Multiplayer Side Quest.

4. **Official Multiplayer Side Quests**
   - Shows open official public Multiplayer Side Quests.
   - Each row should show: title, status, participant count, start/end state, join/open action.

5. **Account readiness**
   - Shows whether Lichess and/or Chess.com username is connected.
   - Lets user add/edit those usernames natively.
   - This is not a big Account page; it is a readiness control because every Side Quest depends on it.

6. **Proof and Coat of Arms access**
   - Recent proof receipt and completed Side Quests.
   - Native share sheet for proof.
   - Coat of Arms gallery can be secondary, not a first-screen driver.

### Tier 2 — useful after launch-critical loop works

1. Push/local notification when a check completes or a Multiplayer Side Quest changes.
2. Live Activity / widget for active Side Quest status.
3. Better Multiplayer Side Quest detail view: standings, participants, Side Quest list, deadline.
4. Search/filter Side Quests.
5. Native proof image viewer and save/share.
6. Create Multiplayer Side Quest natively, if web flow is too heavy.

### Tier 3 — not now / anti-goals

- Full website homepage/marketing in the app.
- Engine analysis, PGN upload, opening study, chess training dashboard.
- Heavy trophy/points dashboard on the first screen.
- Fake boards/tabs/status labels that do not map to real SQC concepts.
- Broad web-view wrapper as the primary app experience.

## Recommended first-screen information architecture

First screen should be **My Side Quests**, not `Live Board`.

Order:

1. Header: `Side Quest Chess` + small account/readiness indicator.
2. `Current Side Quest`
   - Compact row/card, not a large hero.
   - Coat of Arms small left/right marker.
   - status + one action.
3. `My Multiplayer Side Quests`
   - dense rows, all active joined/hosted rows.
4. `Official Multiplayer Side Quests`
   - dense rows, official public opportunities.
5. Optional: recent proof row if there is a fresh result.

## Naming decisions

- Replace `Live Board` with `My Side Quests` or remove the pill entirely.
- Use `Check`, not `Refresh`, when the action runs verifiers.
- Use `View proof`, not generic receipt language on primary actions.
- Use `Coat of Arms`, never `Coats`.
- Use `Side Quest`, never generic `Quest` in visible app labels unless quoting an existing title.

## Data/API gaps that now matter

Existing `/api/mobile/account` already returns:

- active solo Side Quest
- active related Multiplayer Side Quests
- official public Multiplayer Side Quests
- completed Side Quests
- latest receipt
- chess account readiness

Needed to make mobile truly useful:

1. Active Multiplayer rows should include user score/progress and participant count as structured fields, not just copy strings.
2. Official Multiplayer rows should include start/end timestamps and participant count as structured fields.
3. Current Side Quest should expose latest check status in a normalized app-facing enum.
4. Proof/share payload should be first-class for native share sheet.
5. Account readiness should expose missing provider requirement per active Side Quest / Multiplayer Side Quest.

## Implementation recommendation

Pause decorative styling passes. Next actual build should be:

1. Rename/remove `Live Board` immediately.
2. Restore SQC website color constants in mobile.
3. Add this function model to the roadmap as the governing mobile direction.
4. Then rework the first screen around `My Side Quests` and structured real state, not speculative nav.
