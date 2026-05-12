# SQC Multiplayer / Group Competitions Plan — 2026-05-09

## Status

Planning only. No implementation is implied by this document.

This is a future SQC feature track and therefore remains subject to Andreas approval before any website implementation. Current SQC website feature freeze still applies.

## Product idea

Side Quest Chess multiplayer competitions let one or more players create a shared side-quest event:

- one quest or multiple quests;
- open or invite-only;
- public or unlisted/private;
- fixed start/stop windows or manual start/stop;
- clear rules for quest order, scoring, and proof;
- live leaderboard/status view;
- celebratory proof and group results;
- group messaging and invitations.

The core feeling should be:

> “A chess friend starts a ridiculous side-quest league, everyone plays real games elsewhere, SQC verifies the chaos live.”

## Design principles

1. **Do not break solo SQC.** Group competitions are a layer on top of existing quest/proof logic, not a replacement.
2. **Competition progress is separate from personal quest progress.** A player may already have completed a quest personally, but still need a fresh competition-valid completion.
3. **Proof must be time-scoped.** Competition proof should require a public game completed inside the competition’s eligible window, unless the competition explicitly allows retroactive proof.
4. **Creator controls should be powerful but not enterprise-y.** Settings should feel like creating a fun challenge, not configuring SaaS.
5. **Live view should be emotionally useful.** Show who is in, who is attempting, who completed, who is close, and when something funny/worth celebrating happened.
6. **Shareability matters.** Public landing pages and final proof should be linkable without requiring everyone to sign in immediately.
7. **Anti-cheat and fairness should be explicit.** Use public game links, provider data, timestamps, rated/casual constraints, and per-competition proof rules.

## Key distinction: personal completion vs competition completion

This is critical.

A quest can have separate completion states:

- **Personal completion:** user completed quest X in their normal SQC account history.
- **Competition completion:** user completed quest X as part of competition Y under competition Y’s rules.

Example:

- Andreas previously completed `No Castle Club` personally.
- A group competition starts tomorrow and includes `No Castle Club`.
- Andreas’s personal profile can still show the coat/proof as earned.
- But inside the competition, Andreas starts at `not completed` for that quest until he submits or auto-verifies a competition-valid game.

Recommended rule:

> Competition completion requires proof whose `completedGameAt` is within the competition eligibility window and after the participant joined/was accepted, unless the competition explicitly enables retroactive proof.

## Core objects

### Competition

Fields/concepts:

- `id`, slug/share token;
- title, description, cover/crest/theme;
- creator/owner;
- visibility: public, unlisted, private;
- join mode: open, invite-link, approval-required, invite-only;
- status: draft, scheduled, live, paused, ended, archived;
- start mode: manual or scheduled;
- `startsAt`, `endsAt`, optional timezone display;
- max participants;
- allowed providers: Lichess, Chess.com, both;
- rated-only / casual-allowed constraints;
- proof policy;
- scoring policy;
- messaging policy;
- moderation/report controls;
- share settings.

### CompetitionQuestSet

A competition can include:

- one quest;
- fixed ordered quest list;
- unordered quest pool;
- choose-N-of-M quest pool;
- daily/weekly quest rotation;
- team relay sequence later.

Quest set settings:

- quest ids;
- order rule;
- unlock rule;
- per-quest point overrides;
- optional bonus objectives;
- tie-breaker weights;
- whether repeat completions count.

### Participant

Fields/concepts:

- competition id;
- user id if signed in;
- display name;
- Lichess/Chess.com usernames snapshot at join time;
- role: owner, admin, participant, spectator;
- status: invited, joined, pending approval, declined, removed;
- joinedAt;
- eligibleFromAt;
- team id optional;
- notification preferences.

Important: keep provider usernames snapshot for the competition so later account changes do not silently rewrite historical competition proof.

### CompetitionAttempt / CompetitionProof

Separate from personal proof receipt.

Fields/concepts:

- competition id;
- participant id;
- quest id;
- provider;
- game id / URL;
- checkedAt;
- completedGameAt;
- status: pending, passed, failed, invalid, needs-review;
- verifier details;
- score awarded;
- tie-breaker values;
- proof image token;
- celebration event id;
- whether it also updates personal completion.

Recommended policy:

- A competition proof can optionally also count toward personal SQC completion if it passes normal solo rules.
- A solo proof should not automatically count toward competition unless it satisfies competition rules and is explicitly attached to that competition.

### GroupMessage / EventFeed

Two related streams:

1. **Messages:** human chat inside the group.
2. **Events:** system-generated live updates.

Events examples:

- participant joined;
- quest completed;
- proof failed hilariously;
- leaderboard lead changed;
- time window started/ended;
- player unlocked coat;
- final results posted.

For safety/moderation, system event feed can ship before free-form chat.

## Competition modes

### 1. Single Quest Race

Everyone tries the same quest.

Best first multiplayer MVP because it is simple and easy to understand.

Rules examples:

- first to complete wins;
- all completions before deadline ranked by completion time;
- tie-break by game rating, move count, or earliest proof.

### 2. Quest Ladder

Players complete quests in a fixed order.

Rules:

- quest 2 unlocks only after quest 1 is completed;
- leaderboard ranks by highest completed step, then time;
- great for “campaign night” competitions.

### 3. Quest Bingo / Choose N

Competition has a pool; players choose any N quests.

Rules:

- complete any 3 of 7;
- higher difficulty earns more points;
- reduces frustration if one quest is too hard.

### 4. Points League

Players complete as many competition-valid quests as possible before deadline.

Rules:

- each quest awards points;
- repeat completions may be disabled or have diminishing returns;
- good for week/month events.

### 5. Team Relay / Club War later

Team mode where members complete different quests.

Not MVP, but worth designing around so schema does not block teams later.

## Creator flow

1. Create competition.
2. Choose mode:
   - single quest;
   - ordered ladder;
   - quest pool;
   - points league.
3. Select quest(s).
4. Set visibility:
   - public listing;
   - unlisted link;
   - private invite-only.
5. Set join mode:
   - anyone with link;
   - approval required;
   - invite-only.
6. Set time controls:
   - start now;
   - scheduled start;
   - manual start;
   - deadline/end time;
   - pause/resume option.
7. Set proof rules:
   - games must finish after competition start;
   - games must finish after participant joined;
   - rated-only optional;
   - provider constraints;
   - retroactive proof allowed? default no.
8. Set leaderboard rules:
   - fastest completion;
   - points;
   - quest order;
   - tie-breakers.
9. Invite players/share link.
10. Launch live competition.

## Participant flow

1. Open group landing page.
2. See:
   - title/theme;
   - host;
   - status: starts soon/live/ended;
   - quest(s);
   - rules;
   - participants;
   - leaderboard preview.
3. Join or request access.
4. Connect/confirm chess username(s).
5. See personal competition checklist.
6. Play real games on Lichess/Chess.com.
7. Return to SQC:
   - auto-check latest game;
   - or paste specific game URL.
8. See pass/fail/pending proof result.
9. If passed:
   - leaderboard updates;
   - celebration fires;
   - competition proof created;
   - optionally personal profile also updates.
10. Share proof or competition page.

## Landing / leaderboard page

Sharable group page should work in multiple states.

### Before start

- competition title;
- host;
- scheduled start;
- quest/rules preview;
- join/invite CTA;
- participant list;
- countdown.

### Live

- live badge;
- current standings;
- participant status grid;
- active quest(s);
- recent proof feed;
- time remaining;
- CTA: check latest game / submit proof / invite.

### Ended

- winners;
- final leaderboard;
- funniest/rarest completions;
- proof gallery;
- final group certificate/share image;
- rematch CTA.


## First-time invitee clarity pass — 2026-05-12

Andreas feedback: the Competition Leaderboard/progress-bar idea is promising, but the first invitee experience must answer the basic “I have never seen this before” questions before optimizing the competitive UI.

The invitee should never land on a page that assumes they already understand Side Quest Chess or Multiplayer Side Quests. The page must answer, in order:

1. **What is this?**
   - “A friend invited you to a chess side quest.”
   - One plain sentence: play normal games on Lichess/Chess.com, try to satisfy a weird objective, SQC checks the proof.

2. **What am I supposed to do?**
   - Show a short personal next-step card, not a generic marketing section.
   - States: `Join`, `Connect/confirm chess username`, `Play a game`, `Check proof`, `Claim result`.

3. **What are the side quests?**
   - Show the actual quest(s) before or beside the leaderboard.
   - Each quest needs: name, one-line objective, example/clarifier, win requirement, and whether order matters.

4. **Who else is participating?**
   - Keep the Competition Leaderboard/progress bars, but frame it as “Who is in this with me?”
   - Show participants, joined/pending/completed states, and progress toward the quest(s).

5. **What are the rules?**
   - Rules should be a visible compact panel, not hidden settings.
   - Must include: eligible sites, time window, win/rated/variant/time-control constraints, proof method, scoring, tie-breaker, and whether older games count.

6. **What about time?**
   - Show competition state in human language: `Starts in…`, `Live — X left`, `Ended`.
   - If proof only counts after joining/start, say so plainly near the CTA.

7. **What happens next?**
   - The primary CTA must always reflect the invitee’s current state.
   - Avoid multiple equal-weight actions on first view. One main action plus one small “See rules”/“How it works” link is enough.

Recommended page hierarchy for an invite-link landing page:

1. **Invite hero / plain-language premise**
   - `You were invited to No Castle Night`
   - `Try to win a real chess game without castling. Side Quest Chess checks your public game and updates this leaderboard.`
   - Primary CTA: state-aware.

2. **Your next step**
   - Small checklist with only the next 3–5 steps.
   - This is the orientation anchor for a confused invitee.

3. **The side quest(s)**
   - Quest card(s) with objective, example, constraints, and progress.

4. **Competition leaderboard**
   - Progress bars/status rows stay, but they are now understandable because the quest/rules context came first.

5. **Rules and time window**
   - Compact, scannable, always available.

6. **Activity / proof feed**
   - Recent joins, proof checks, completions, lead changes. Good for energy, but lower priority than orientation.

UX rule: if the user has not joined yet, the page should behave more like an invitation than a dashboard. After joining, it can shift toward leaderboard/proof workflow.

## Live status model

Competition live view should auto-update without being heavy.

Possible statuses per participant/quest:

- not joined;
- joined, no proof yet;
- checking;
- failed latest proof;
- completed;
- needs review;
- disqualified/removed;
- late proof not eligible.

Auto-update options:

- MVP: polling every 10–30 seconds on live page;
- later: server-sent events or websockets;
- always include manual refresh.

## Celebrations

Good celebration opportunities:

- first player joins;
- competition starts;
- first completion;
- new leaderboard leader;
- rare/absurd quest completed;
- player completes full ladder;
- competition ends;
- final champion crowned.

Celebration artifacts:

- competition proof card;
- winner seal;
- group crest;
- “chaos log” recap;
- share image with top 3 and completed quests;
- personal proof receipt linked back to group.

Tone should stay SQC: playful, ceremonial, slightly dumb, not corporate esports.

## Messaging

### MVP recommendation

Do **not** start with full free-form chat unless necessary. It adds moderation, abuse, notifications, and storage concerns.

Better staged approach:

1. System event feed.
2. Quick reactions/emotes to events.
3. Preset taunts/encouragements.
4. Free-form group chat later with moderation/report/delete controls.

### If free-form chat is required

Needed controls:

- only participants can post by default;
- owner/admin delete messages;
- mute participant;
- report message;
- rate limits;
- profanity/abuse handling later;
- private competitions still need safe moderation.

## Open vs closed / public vs private

Separate two concepts:

### Join access

- open: anyone can join;
- invite-link: anyone with link can join;
- approval-required: request to join;
- invite-only: only invited accounts/usernames.

### Page visibility

- public: discoverable/listed;
- unlisted: linkable but not listed;
- private: only participants/admins can view details.

Examples:

- Public page + open join = public tournament.
- Public page + approval = visible club event.
- Unlisted + invite link = friend group.
- Private + invite-only = closed team challenge.

## Time controls

Competition time fields/rules:

- draft: creator can edit freely;
- scheduled: starts automatically at `startsAt`;
- live: proof accepted if within window;
- paused: no new proof accepted, or proof accepted but leaderboard frozen — choose one policy;
- ended: no new proof accepted unless admin reopens;
- archived: read-only.

Proof eligibility should check:

- game completion time >= competition startsAt;
- game completion time <= competition endsAt if set;
- game completion time >= participant eligibleFromAt;
- provider/rated/time-control rules;
- quest-specific verifier rules.

## Quest order/rule variants

- `any_order`: quests can be completed in any order.
- `fixed_order`: quest N+1 only counts after N passed.
- `unlock_on_completion`: next quest revealed after prior completion.
- `choose_n`: complete any N from pool.
- `daily_unlock`: new quest available each day.
- `host_choice`: creator can manually unlock next quest.

Recommended MVP:

1. single quest race;
2. fixed-order ladder;
3. points pool later.

## Scoring options

MVP scoring:

- passed quest = points from quest reward;
- earliest completion tie-break;
- all failed/pending proofs shown but no points.

Later scoring options:

- bonus for first completion;
- bonus for rated games;
- difficulty multipliers;
- team average/total;
- streak bonus;
- style/funny awards manually granted by host.

## Data integrity / proof rules

Must preserve fairness:

- Store competition-specific attempts separately.
- Store exact game id/provider and completion timestamp.
- Do not let a single game count twice in the same competition unless explicitly allowed.
- Do not let old solo completions auto-complete competition quests by default.
- If a game was used for personal proof before, it may count for competition only if it satisfies competition time/window rules and competition allows reuse.
- Keep verifier result immutable enough for audit; later checks can append new receipts rather than silently rewrite old outcomes.

## Admin controls

Owner/admin can:

- edit draft settings;
- start/stop/pause/resume;
- invite/remove participants;
- approve join requests;
- pin message/event;
- hide/delete messages;
- disqualify proof or participant;
- reopen ended competition if necessary;
- export/share final results.

Guardrails:

- settings that affect fairness should lock after competition starts, or require visible “rules changed” event.
- if rules change mid-competition, show timestamped audit entry.

## Notifications

Useful notification events:

- invited to competition;
- competition starting soon;
- competition started;
- someone passed your score;
- your proof passed/failed;
- competition ending soon;
- final results ready.

Channels:

- in-app;
- email later;
- push later for mobile app;
- share links for external messaging.

## MVP recommendation

Build eventually in stages, not all at once.

### MVP 1 — Single Quest Competition

- create competition with one quest;
- unlisted share link;
- invite/join link;
- manual or scheduled start/end;
- participants join with signed-in SQC accounts;
- competition-specific proof status separate from personal completion;
- latest-game check or game URL proof;
- live leaderboard with polling;
- system event feed;
- final results page;
- proof/share card.

This validates the core multiplayer loop.

### MVP 2 — Multi Quest Ladder

- multiple quests;
- fixed order;
- per-participant quest progress;
- leaderboard by step + completion time;
- better celebrations.

### MVP 3 — Access/settings depth

- public/private/open/approval modes;
- owner controls;
- participant moderation;
- richer invite flow.

### MVP 4 — Messaging/social

- reactions/preset messages first;
- free-form chat only once moderation controls exist.

### MVP 5 — Leagues/teams

- recurring competitions;
- teams/clubs;
- seasonal leaderboards;
- public discovery.

## Suggested pages/screens

Website future surfaces:

- `/competitions` — discovery/listing, maybe later only.
- `/competitions/new` — creator flow.
- `/competitions/[slug]` — public/unlisted landing + leaderboard.
- `/competitions/[slug]/join` — join/accept invite.
- `/competitions/[slug]/admin` — creator controls.
- `/competitions/[slug]/proof/[receipt]` — competition proof receipt/share.

Mobile future surfaces:

- Competition invite landing;
- live competition cockpit;
- personal competition checklist;
- proof submit/check handoff;
- push notification deep links;
- final celebration/proof share.

## API / backend shape

Future app-facing/web-facing API groups:

- `POST /api/competitions` create;
- `GET /api/competitions/[id]` read summary;
- `PATCH /api/competitions/[id]` settings/admin;
- `POST /api/competitions/[id]/join` join/request;
- `POST /api/competitions/[id]/invite` invite;
- `GET /api/competitions/[id]/leaderboard` leaderboard;
- `GET /api/competitions/[id]/events` event feed;
- `POST /api/competitions/[id]/proof/latest-game` check latest game;
- `POST /api/competitions/[id]/proof/game-url` check specific game;
- `POST /api/competitions/[id]/messages` later chat.

## Open questions for Andreas later

No need to answer now before planning is useful, but these affect implementation:

1. Should competitions initially require all participants to be signed in?
2. Should invite-by-Lichess/Chess.com username work before the invited person has an SQC account?
3. Should retroactive proof ever be allowed, or always fresh-after-start?
4. Should a competition proof also earn personal coat/points by default?
5. Is free-form group chat required for v1, or can event feed + reactions come first?
6. Should public competitions be discoverable at launch, or only share-link based first?
7. Should hosts be allowed to manually approve/disqualify proof?
8. Should competitions support teams in v1 or only individual players?

## Recommendation

When approved for implementation, start with:

> **Single Quest Competition, unlisted invite link, signed-in participants, fresh proof after competition start, live leaderboard, system event feed, final proof celebration.**

This gives the multiplayer magic with the least risk and directly solves the important state separation between personal completions and competition completions.
