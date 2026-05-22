# SQC Native App Definition Reset — 2026-05-22

## Reset statement

Start over from scratch for the native app concept.

Keep nothing from the previous mobile UI direction as binding: not the website-parity app, not the tracker experiments, not `Live Board`, not generic tabs, not the bottom bar/top menu debate. The only preserved product facts are the Side Quest Chess product itself, the website color scheme, and the requirement that the app is for logged-in users.

## One-sentence app definition

**The SQC app is the logged-in player’s command center for choosing what to attempt next, checking whether real chess games completed it, and following active Multiplayer Side Quests.**

Even shorter:

> **Open SQC. See what to do next. Check if it counted.**

## Who the app is for

Logged-in existing or returning Side Quest Chess players who already understand the basic premise:

- They play real games on Lichess or Chess.com.
- They want weird SQC objectives layered on top.
- They want quick status, proof, and Multiplayer Side Quest participation.

The app is **not** primarily for explaining the brand to a cold visitor. Signed-out screens should exist, but they are not the product center.

## Product job

When a logged-in player opens the app, it should answer, in this order:

1. **What am I currently trying to complete?**
2. **Can SQC check my latest games now?**
3. **Did I complete it? If yes, where is my proof / Coat of Arms?**
4. **Which Multiplayer Side Quests am I in, and what is my standing/progress?**
5. **What official Multiplayer Side Quest can I join next?**
6. **Is anything blocking me, such as missing Lichess/Chess.com username?**

If a screen does not support one of those jobs, it probably does not belong in v1 mobile.

## Core principles

1. **Logged-in first**
   - The app assumes identity and state.
   - Signed-out mode is a thin sign-in gate, not a public website clone.

2. **Action over explanation**
   - The user should see status and buttons, not marketing copy.
   - Use short labels: `Check`, `View proof`, `Join`, `Open`, `Connect Lichess`, `Connect Chess.com`.

3. **One current Solo Side Quest**
   - Solo play revolves around one active Side Quest at a time.
   - The app should make this impossible to miss.

4. **Multiplayer is a first-class mobile use case**
   - Users may have multiple active Multiplayer Side Quests.
   - Official Multiplayer Side Quests may be multiple and should be easy to join.

5. **Proof is the reward moment**
   - Completion should quickly lead to proof and Coat of Arms.
   - Sharing proof is a native app strength.

6. **Website color scheme always**
   - Native UI must use the SQC website palette: black/deep dark background, warm paper text, gold/pink/green/blue accents.
   - Never switch to Apple Sports blue as a theme. Apple Sports is a functional reference only.

7. **No fake app concepts**
   - Do not use `Live Board`, `Tracker`, `Mission`, `Coats`, generic `Quest`, or invented sports metaphors.
   - Use SQC words precisely: `Side Quest`, `Multiplayer Side Quest`, `Official Multiplayer Side Quest`, `Coat of Arms`, `Proof`.

## Proposed v1 app structure

### Primary screen: `Home`

Purpose: the logged-in player’s next action.

Sections:

1. **Readiness strip**
   - Small, dismissable-looking status line:
     - `Lichess connected` / `Add Lichess`
     - `Chess.com connected` / `Add Chess.com`
   - If both missing, this becomes the first actionable block.

2. **Current Side Quest**
   - Compact but prominent.
   - Contains:
     - Coat of Arms image.
     - Side Quest title.
     - current status: `In progress`, `Completed`, `Needs game`, `No active Side Quest`.
     - latest check summary if available.
     - one primary action:
       - `Check` if active and not completed.
       - `View proof` if completed.
       - `Pick Side Quest` if none.
   - Secondary action only when needed: `Open rules`.

3. **My Multiplayer Side Quests**
   - Dense rows.
   - Each row:
     - Multiplayer Side Quest name.
     - status: `Live`, `Soon`, `Finished`.
     - participant count.
     - user score/progress if available.
     - tap opens detail.
   - If empty: one row: `Join an Official Multiplayer Side Quest`.

4. **Official Multiplayer Side Quests**
   - Dense rows.
   - Each row:
     - official name.
     - status/deadline.
     - participant count.
     - `Join` affordance.

5. **Recent proof**
   - Only if there is a recent completed proof or latest check result worth showing.
   - One row: title, pass/fail/pending, `Share` or `Open`.

### Screen: `Side Quests`

Purpose: choose or change the active Solo Side Quest.

Functions:

- Browse available Side Quests.
- Show active/completed state inline.
- Open Side Quest details.
- Start Side Quest.
- Reset/change active Side Quest only when rules allow.

Do not over-explain the whole product here. The user is already logged in.

### Screen: `Multiplayer`

Purpose: participate in Multiplayer Side Quests.

Functions:

- List `My Multiplayer Side Quests`.
- List `Official Multiplayer Side Quests`.
- Join official public Multiplayer Side Quest.
- Open detail: leaderboard, participant rows, included Side Quests, deadline, check/refresh status.
- Later: create Multiplayer Side Quest if native creation becomes necessary.

### Screen: `Proof`

Purpose: completed Side Quests, Coat of Arms, sharing.

Functions:

- Recent proof receipts.
- Completed Side Quests.
- Coat of Arms gallery.
- Native share sheet for proof.
- Open public proof page when needed.

This replaces a generic `Coat of Arms` tab. The user job is proof/reward/share; Coat of Arms is part of that.

### Screen: `Account`

Purpose: only settings/readiness, not a dashboard.

Functions:

- Display SQC profile name.
- Edit Lichess username.
- Edit Chess.com username.
- Sign out.
- Support/privacy links.

Do not make Account a second homepage.

## Navigation recommendation

Use a very small native tab structure only if needed:

1. `Home`
2. `Side Quests`
3. `Multiplayer`
4. `Proof`
5. `Account`

But if this feels too heavy, v1 can start with:

1. `Home`
2. `Side Quests`
3. `Multiplayer`
4. `Proof`

…and put account readiness/settings inside Home or a header action.

Do **not** add decorative top menu variants. Navigation should be boring and predictable.

## Home screen data contract needed

Existing `/api/mobile/account` is close, but the app needs a cleaner home payload:

```ts
type MobileHome = {
  user: {
    displayName: string;
    imageUrl: string | null;
  };
  readiness: {
    lichessUsername: string | null;
    chessComUsername: string | null;
    hasPlayableAccount: boolean;
    missingRequiredAction: string | null;
  };
  currentSideQuest: {
    id: string;
    title: string;
    status: "none" | "in_progress" | "completed" | "needs_game" | "check_failed";
    coatOfArmsImageUrl: string | null;
    latestCheckSummary: string | null;
    primaryAction: "pick" | "check" | "view_proof";
    proofHref: string | null;
  } | null;
  myMultiplayerSideQuests: Array<{
    id: string;
    title: string;
    status: "soon" | "live" | "finished";
    participantCount: number;
    myScore: number | null;
    myCompletedCount: number | null;
    href: string;
  }>;
  officialMultiplayerSideQuests: Array<{
    id: string;
    title: string;
    status: "soon" | "live" | "finished";
    participantCount: number;
    startsAt: string | null;
    endsAt: string | null;
    href: string;
  }>;
  recentProof: {
    title: string;
    status: "passed" | "failed" | "pending";
    proofHref: string | null;
    proofImageUrl: string | null;
  } | null;
};
```

## What to build first

1. Freeze this definition as the app spec.
2. Replace current native app UI with a clean logged-in `Home` prototype built from the structure above.
3. Use dev preview account only to simulate real logged-in data, but keep the UI honest to the future API contract.
4. Then implement the real API fields that the app needs.
5. Then add real native actions: `Check`, `Join`, `Share proof`, username edit.

## Acceptance checklist for the next prototype

A screenshot is good only if a logged-in user can immediately answer:

- What is my current Side Quest?
- What should I tap next?
- Am I blocked by missing chess account info?
- What Multiplayer Side Quests am I in?
- What Official Multiplayer Side Quests can I join?
- Where is my latest proof/reward?

If the screenshot mostly shows branding, navigation, or marketing copy, it fails.
