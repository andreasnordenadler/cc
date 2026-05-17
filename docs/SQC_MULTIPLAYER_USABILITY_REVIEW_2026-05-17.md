# SQC Multiplayer usability review — 2026-05-17

Scope: end-user review of Multiplayer Side Quests from discovery → public list → invite/detail → accepted/live page → create/join/proof concepts.

Evidence used:
- Live anonymous browser review of `https://sidequestchess.com/groupquests`
- Live anonymous browser review of `https://sidequestchess.com/groupquests/public`
- Live anonymous browser review of `https://sidequestchess.com/groupquests/no-castle-night-27-ne4vge`
- Live anonymous browser review of `https://sidequestchess.com/groupquests/no-castle-night-27-ne4vge?accepted=1`
- Code review of group quest pages/components/API routes.

## Executive summary

The core Multiplayer Side Quest concept is now visible and understandable, but the current UX still feels like a product surface with internal/prototype seams exposed. The main issues are not visual polish; they are trust, truthfulness, and flow clarity.

A normal user can understand “create or join a silly chess challenge with friends,” but the surface currently risks confusing or undermining trust because:

1. Public listings show test/spam content and raw ISO dates.
2. Invite pages can show contradictory schedule information.
3. `?accepted=1` can make an anonymous user see an accepted/live competition state even when they are not truly joined.
4. Some host-created rules are shown as locked but are not clearly enforced by verifier logic.
5. The create flow asks for many settings before the user has confidence the resulting quest will be simple and shareable.

## High-priority usability problems

### P0/P1 — Anonymous users can force the accepted state with `?accepted=1`

Observed live: opening `/groupquests/no-castle-night-27-ne4vge?accepted=1` while signed out shows:

- `You’re in`
- `Your rank` / `Your points`
- `Refresh checks`
- `Leave quest`

But the user is not signed in and is not a real participant. This is a trust-breaking state. It makes the page lie about membership and exposes controls that cannot succeed cleanly.

Recommendation:
- Only show accepted/live participant UI when `hasServerParticipant === true`.
- If `accepted=1` is present but there is no real server participant, redirect/normalize to the invite page or show a clear “Sign in / rejoin to continue” state.
- Treat query params as hints only, never membership truth.

### P1 — Public listings contain visible test/prototype content

Observed live on `/groupquests/public`:

- Multiple `No Castle Night 25/26/27` rows.
- One row has malformed/test copy: `A friend invited you to a cokokokokkook hess side quest...`
- Raw timestamps like `2026-05-16T12:00 → 2026-05-23T23:59`.

For an end user, this makes the product feel fake or unmoderated.

Recommendation:
- Hide or archive obvious test quests from public listings.
- Add a public listing quality filter: non-empty title, sane invite copy, active window, maybe minimum host/account validity.
- Format public dates as human readable: `May 16, 12:00 → May 23, 23:59`.

### P1 — Invite page can show contradictory schedules

Observed live on `/groupquests/no-castle-night-27-ne4vge`:

- Summary card says `Starts 2026-05-15T12:00`, `Ends 2026-05-23T23:59`.
- Rules section says `Starts May 12, 10:00 CEST`, `Ends May 21, 00:00 CEST`.

This is likely from hard-coded `ruleSummary` values mixed with saved quest values. It directly undermines confidence in what counts.

Recommendation:
- Build all date/rule displays from the saved quest object.
- Remove hard-coded competition dates from dynamic quest pages.
- Format consistently everywhere.

### P1 — “Locked rules” overpromise verifier enforcement

Create flow lets hosts set:

- provider
- time control
- rated/casual
- color
- window

Accepted page presents these as locked competition rules. Code review shows multiplayer refresh checks currently pass only challenge/provider/username/start/end into `checkLatestGroupQuestChallenge`; `rules.timeControl`, `rules.rated`, and `rules.color` are not passed into proof enforcement.

User impact: host may think “Blitz 5+0 only” or “Black only” is enforced when it may not be.

Recommendation:
- Short term: label unsupported rules as “display/host rules” or remove them from create until enforced.
- Better: pass rule constraints into verifier and show per-check reason when a game fails because of time/rated/color.

### P1 — Join/accept decision has too much uncertainty

The invite page has strong “Accept” CTAs, but the user still has unanswered questions:

- Do I need to already have a chess username saved?
- Can I join before the start time?
- What happens if I fail one quest?
- Can I change provider after joining?
- Is proof automatic or do I need to paste something?

Recommendation:
- Add one compact “Before you accept” panel near the first CTA:
  - `You’ll need a public Lichess or Chess.com username.`
  - `Only games after joining / inside this window count.`
  - `Refresh checks after you play.`
  - `You can leave and rejoin while open.`

## Medium-priority usability problems

### P2 — Public overview copy is clear but too explanatory

`/groupquests` explains the concept well, but the signed-out page reads more like documentation than a product decision page. The first visible promise should be sharper:

- “Challenge friends to weird chess goals.”
- “Play on Lichess/Chess.com.”
- “SQC checks the proof and ranks everyone.”

Recommendation:
- Keep the explanation lower on the page.
- Make the first screen more action-oriented: Join public / Create after sign-in / View example.

### P2 — Create flow is powerful but heavy

The create builder asks for name, invite copy, side quests, visibility, schedule, provider, game rules, and preview before saving. For a first-time host, this can feel like admin software.

Recommendation:
- Offer a fast-start preset path: `Start with default No Castle Night`.
- Make advanced rules collapsible.
- Default to fewer choices: quest stack + dates + visibility first; rules later.

### P2 — Date and wording consistency needs tightening

Current terminology still mixes:

- Multiplayer Side Quest
- Side Quest
- Competition
- Table
- Public listing

Most of these are understandable, but in the same flow they create cognitive load.

Recommendation:
- User-facing primary noun: `Multiplayer Side Quest`.
- Supporting noun: `leaderboard`.
- Avoid `table`, `room`, and generic `competition` unless context needs it.

### P2 — “Refresh checks” needs more explanation/result clarity

The live page has a `Refresh checks` button. It returns a small status, then refreshes the route. For real users, this is the moment of truth and should be more ceremonial and more explicit.

Recommendation:
- Rename to `Check my latest games`.
- After refresh, show a short result block:
  - passed quests
  - failed/pending reasons
  - which game was checked
  - what to do next

### P2 — Leaderboard detail is dense

The leaderboard row currently contains rank, name, handle, progress bar, points, proof summary, and expandable finish times. It works, but long proof summaries can dominate the row.

Recommendation:
- Keep row compact: name, progress, points, last checked time.
- Move proof summary into the expanded details.

## Positive findings

- The public concept page does communicate the core idea: create/invite/play/prove.
- Public invite pages are shareable and inspectable without login, which matches the access model.
- The share/copy actions are now visible enough.
- The leaderboard/proof direction is compelling; it just needs tighter truth states.
- Server-backed join/leave/refresh routes now exist, which is the right architecture direction.

## Recommended fix order

1. Fix `?accepted=1` truth state so only real participants see the accepted/live page.
2. Replace hard-coded date/rule summary on dynamic invite pages with saved quest values.
3. Clean/filter public listings and format dates.
4. Align displayed locked rules with actual verifier enforcement.
5. Improve the accept/join explanation and rename `Refresh checks` to `Check my latest games`.
6. Simplify create flow with presets/collapsed advanced rules.

## Suggested acceptance criteria for the next sweep

- Anonymous invite links never say `You’re in` unless the user is actually joined.
- Every date shown for a quest matches the same saved `startAt/endAt` values and is human-readable.
- Public listings contain no obvious test/spam rows.
- Any displayed mandatory rule is either enforced by proof checks or explicitly marked as a host/display rule.
- A new user can answer, within 10 seconds: what do I do, where do I play, how proof is checked, and how I win.
