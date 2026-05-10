# SQC Group Side Quests Access Model — 2026-05-10

## Purpose

Define how people access, join, and prove progress in Side Quest Chess **Group Side Quests**, especially when invited players do not yet have an SQC account.

This is product/design planning. It does not implement new website behavior by itself.

## Decision

Andreas agreed 100% on 2026-05-10: use a **link-first, chess-ID-first, account-later** access model for Group Side Quests. Invited players should be able to join with a Lichess/Chess.com username before creating an SQC account, then claim/save proof later.


## Recommended answer

Group Side Quests should be accessible through **shareable room links first**, with account creation delayed until the moment it becomes useful.

The ideal flow is:

> Creator makes a Group Side Quest → shares a link → invited person opens it → enters or confirms chess ID → optionally joins as guest → plays on Lichess/Chess.com → SQC verifies proof → account signup is offered to save identity, badges, and future groups.

Do **not** require every invitee to create an SQC account before they understand the room. That would kill the social loop.

## Access layers

### 1. Public preview access

Anyone with the link should be able to see a safe landing/preview version unless the group is fully private.

Visible before joining:

- group name;
- host display name;
- quest/rules summary;
- provider requirements: Lichess, Chess.com, or both;
- required time control/rated/variant/color rules;
- participant count and maybe display names depending on privacy;
- start/end window;
- clear CTA: `Join this Group Side Quest`.

Do not show sensitive data, invitee emails, private chat, moderation controls, or hidden participants to non-members.

### 2. Join access

Group Side Quests should support multiple access policies:

1. **Anyone with link can join** — best default for friends.
2. **Invite link with optional passcode** — good lightweight private mode.
3. **Approval required** — creator reviews join requests.
4. **Invite-only** — only pre-invited SQC users or chess IDs may join.

For MVP, use:

- link access;
- invite-only by chess ID snapshot later;
- approval later if needed.

### 3. Member access

After joining, participant can see:

- their proof checklist;
- exact game constraints;
- leaderboard;
- event feed;
- proof actions;
- invite/share actions if allowed;
- final proof/result after the group ends.

## Account strategy

### Core principle

Use **chess identity first, SQC account second**.

For SQC, the user’s external chess ID is the practical proof identity. The SQC account is for persistence, ownership, notifications, badges, history, and anti-abuse.

### Three participant states

#### A. Signed-in SQC member

Best case.

Flow:

1. Opens group link.
2. SQC knows account.
3. SQC pre-fills saved Lichess/Chess.com usernames.
4. User confirms which provider username to use for this group.
5. Joins.

Important: store a **competition username snapshot** at join time so later profile edits do not rewrite old proof.

#### B. Guest with chess ID

This is the key viral/invite path.

Flow:

1. Opens group link.
2. Clicks `Join as guest`.
3. Enters display name and Lichess/Chess.com username.
4. SQC validates that the public username exists when possible.
5. Guest joins the room and gets a local/session participant token.
6. Guest can check latest game or paste game URL.
7. After proof or when leaving, SQC prompts: `Save your proof with a free SQC account`.

This should be allowed for low-friction friend groups.

Limitations for guests:

- cannot create groups;
- may lose room access if they lose the invite link/session unless they later claim it;
- limited notifications;
- stricter rate limits;
- creator/admin can remove them;
- public proof may show `unclaimed guest` until claimed.

#### C. Invited person without SQC account but prefilled by creator

Creator can invite by chess ID before the invitee arrives.

Flow:

1. Creator adds `lichess:and72nor` or `chess.com:someuser`.
2. Room shows pending participant row: `and72nor — invited`.
3. Invite link contains a participant claim token, not just the public room URL.
4. Invitee opens link.
5. SQC says: `You were invited as lichess:and72nor. Confirm this is you.`
6. Invitee can join as guest or create/sign in to claim permanently.

This is useful because the host often knows everyone’s chess handles already.

## Should invited people enter chess IDs themselves?

Yes, but not only that.

Recommended model:

### Creator can add chess IDs during invite

Best for small friend groups.

Creator sees:

- `Add by Lichess username`;
- `Add by Chess.com username`;
- optional display label;
- optional team.

This creates pending invite slots.

### Invitee can also enter their own chess ID

Best when creator only has a WhatsApp/Discord/Telegram group and not everyone’s handles.

Invitee sees:

- provider choice: Lichess / Chess.com;
- username field;
- display name field;
- `This is the account SQC will check for group proof`.

### Signed-in users can confirm saved chess IDs

If logged in:

- show saved IDs;
- allow one-click confirmation;
- allow `use another chess ID for this group` if needed.

## Invite mechanics

### Recommended MVP invite types

#### 1. General room invite link

Example:

`sidequestchess.com/groupquests/gq_abc123?invite=room_xxx`

Anyone with the link can preview and join if room policy allows it.

Use for:

- friend groups;
- streamer/community rooms;
- casual challenges.

#### 2. Personal invite claim link

Example:

`sidequestchess.com/groupquests/gq_abc123/invite/inv_789`

This maps to a pending participant slot.

Use for:

- invite-only groups;
- creator-added chess IDs;
- private competitions.

#### 3. Public discoverable page later

Only for intentionally public group quests.

Use for:

- official SQC events;
- creator/streamer tournaments;
- seasonal rooms.

## Verification identity rules

### At join time

Store:

- participant display name;
- selected provider;
- selected chess username;
- username normalized form;
- `eligibleFromAt` timestamp;
- join method;
- account user ID if signed in;
- guest token hash if guest.

### At proof time

Proof must match the participant’s selected chess identity.

A game is competition-valid only if:

- it belongs to the selected Lichess/Chess.com username;
- it ended after competition start;
- it ended after participant `eligibleFromAt`;
- it matches the group’s mandatory game rules;
- it satisfies the quest verifier;
- it has not already been used for the same group proof if duplicates are disallowed.

## Claiming and upgrading guests

Guest participation should be claimable later.

Important flows:

### Guest completes proof, then signs up

After proof pass:

> `Victory recorded. Create a free SQC account to keep this coat of arms and find it later.`

If user signs up, attach the guest participant/proof to their SQC user account.

### Signed-in user tries to claim an existing guest slot

Allow if:

- they have the claim token;
- the chess ID matches one of their saved/confirmed provider usernames;
- or they pass a lightweight confirmation step.

### Avoid account squatting

Do not let a random SQC user claim someone else’s public chess username just because they type it.

For MVP, rely on claim-token possession plus public-game proof. Later add stronger provider verification if needed.

## Privacy and safety

### Display names

For guests, display name can default to chess username.

Avoid showing real names unless user sets them.

### Private rooms

Private room non-members should see either:

- a minimal locked page; or
- title + host + join/request CTA, depending on creator setting.

### Invite abuse controls

Needed early:

- regenerate invite link;
- disable invite link;
- remove participant;
- block rejoin for removed participant;
- creator/admin controls for pending invites.

### Rate limits

Guest join and proof checks need stricter rate limits than signed-in accounts.

## UX copy recommendations

### Group page CTA states

Signed out:

- `Join this Group Side Quest`
- Secondary: `Already have an account? Sign in`

Join modal:

- `How should SQC check your games?`
- `Choose the chess account you’ll use for this group.`
- `You can play on Lichess or Chess.com. SQC only checks public games that match the room rules.`

Guest join:

- `Continue as guest`
- `No SQC account needed yet. You can save your proof later.`

Post-proof signup:

- `Save this victory`
- `Create a free account to keep your proof, coat of arms, and group history.`

Creator invite UI:

- `Invite by link`
- `Add chess usernames`
- `Paste Lichess or Chess.com names, one per line`
- `They can claim their slot when they open the invite.`

## Recommended MVP scope

Build in this order:

1. **Room link access**: anyone with link can preview/join.
2. **Guest join with chess ID**: provider + username + display name.
3. **Signed-in join with saved chess ID confirmation**.
4. **Creator invite by link**: copy/regenerate/disable.
5. **Creator add pending chess IDs**: invited rows before users arrive.
6. **Personal claim links** for pending invites.
7. **Guest-to-account claiming** after proof.
8. **Approval/private modes**.
9. **Provider account verification hardening** if abuse appears.

## Product recommendation

For SQC’s tone and growth loop, the default should be:

> “Send this link to your chess friends. They do not need an SQC account to understand or join. They just pick/confirm their Lichess or Chess.com username, play the required game, and come back for proof. If they win something, then SQC asks them to save it.”

This keeps the feature social, fast, and playful instead of turning it into account-management software.
