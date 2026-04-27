# SQC Combo-Quests / Stacked Quests — Future Add-on Spec

Date: 2026-04-27 20:40 Europe/Stockholm  
Owner: Sam  
Status: design-ready future add-on; not a current v1 blocker

## Why this exists

Andreas suggested letting players stack multiple quests on top of each other and complete them in a single game. This is a strong Side Quest Chess idea because it makes the product more viral without changing the core loop:

> Pick a bad idea → play a real game → Side Quest Chess verifies the receipt → brag/share.

The risk is complexity. Combo-quests should feel like a bonus chaos mode, not like a settings panel.

## Product rule

Combo-quests are an opt-in advanced ritual called **Quest Stacks**.

Short copy options:

- **Quest Stack** — clearest product label.
- **Combo Run** — good for receipts and scoring.
- **Bad Idea Pile** — funniest flavor copy, best as an in-page nickname.

Recommended public copy:

> Stack two or three bad ideas into one game. If the same receipt satisfies all of them, you get the combo bonus.

## UX model

### Entry points

1. Challenge detail page
   - Secondary CTA: `Add to quest stack`
   - Keep primary CTA as `Start this dare`.
2. Challenge hub
   - Small stack toggle on each challenge card.
   - Persistent bottom tray appears only after at least one quest is selected.
3. Future `/stack` route
   - Dedicated builder for reviewing the stack before playing.

### Builder flow

1. Pick 2–3 compatible challenges.
2. See a one-screen feasibility check:
   - difficulty multiplier
   - combined reward
   - verifier readiness
   - conflicting-rule warning if any
3. Start the stack.
4. Play normally on Lichess/Chess.com.
5. Latest-game checker evaluates every selected quest against the same game.
6. Receipt shows:
   - each quest pass/fail/pending
   - combo result
   - bonus points if all pass
   - shareable `I survived this bad idea pile` proof card

## Selection limits

Start deliberately small:

- Minimum: 2 quests.
- Maximum: 3 quests.
- Only one active stack at a time.
- Only live-backed or next-adapter quests can be selected for an automated stack UI at first.
- Specified-only quests may appear as disabled with copy: `Rules written; verifier not live yet.`

This prevents fake-proof claims and keeps the first version shippable.

## Compatibility model

Every challenge should expose machine-readable verifier requirements:

```ts
type StackRequirement = {
  challengeId: string;
  result: "win" | "draw" | "loss" | "finish";
  minimumMoves?: number;
  requiredSide?: "white" | "black" | "either";
  forbiddenMoveKinds?: string[];
  requiredMoveKinds?: string[];
  requiredPieceEvents?: string[];
  forbiddenPieceEvents?: string[];
  timeClasses?: string[];
  variants?: "standard-only" | "any";
};
```

A stack is compatible when:

- all challenges can be checked against the same normalized game record
- result requirements do not conflict
- side requirements do not conflict
- minimum move requirements can all be satisfied by one game
- forbidden and required events do not directly contradict each other

## Starter compatibility matrix

### Good first stack candidates

1. **Queen? Never Heard of Her** + **No Castle Club**
   - Win after losing queen early.
   - Do not castle.
   - Same game can satisfy both cleanly.
   - This should be the first demo stack.

2. **No Castle Club** + **Pawn Storm Maniac**
   - Win without castling.
   - Move six pawns before move 15.
   - Funny and feasible; strong chaos identity.

3. **No Castle Club** + **Knightmare Mode**
   - Win without castling.
   - Mate with a knight.
   - Cleaner once mate-piece detector exists.

### Riskier stacks

1. **Queen? Never Heard of Her** + **Rookless Rampage**
   - Possible, but very punishing.
   - Should get an `Absurd combo` label.

2. **The Blunder Gambit** + **Queen? Never Heard of Her**
   - Needs careful material-loss interpretation so the queen sacrifice does not double-count as the blunder unless intentionally allowed.

### Likely conflicts / defer

- Anything requiring a draw/loss should not stack with current win-required starter quests unless a later challenge explicitly supports non-win stacks.
- Side-locked future quests may conflict if one requires White and another requires Black.

## Scoring model

Use transparent additive scoring plus a small combo multiplier.

```ts
baseReward = sum(selectedChallengeRewards)
comboBonus = round(baseReward * bonusRate)
totalReward = baseReward + comboBonus
```

Recommended bonus rates:

- 2-quest stack: +20%
- 3-quest stack: +50%
- First-ever completed stack: extra +100 points

Receipt copy examples:

- `2-quest combo cleared: Queenless + Uncastled.`
- `Bad idea pile survived. +780 points.`
- `Stack failed honestly: 1 of 2 quests cleared.`

Important: partial success should save individual completed receipts, but not award the combo bonus.

## Verifier requirements

The verifier layer should not run separate latest-game checks per challenge. It should normalize the latest game once, then apply multiple predicates.

```ts
type ChallengePredicateResult = {
  challengeId: string;
  passed: boolean;
  evidence: string[];
  failureReason?: string;
};

type StackVerifierResult = {
  stackId: string;
  gameId: string;
  provider: "lichess" | "chesscom";
  checkedAt: string;
  results: ChallengePredicateResult[];
  comboPassed: boolean;
  baseReward: number;
  comboBonus: number;
  totalReward: number;
};
```

Needed implementation steps before live stack verification:

1. Promote existing queenless and no-castle logic into shared predicate functions that accept one normalized game object.
2. Add a `checkChallengeStack()` server action.
3. Store latest stack receipt separately from single-challenge attempts, or extend attempts with `challengeIds: string[]`.
4. Render a stack receipt card on `/result` and `/proof-log`.
5. Add challenge-specific status honesty: only stack live-backed predicates without implying specified-only support.

## First shippable version

Best v1 combo implementation:

- Route: `/stack`
- Initial selectable stack: Queenless + No Castle Club only
- Label: `First official bad idea pile`
- Checker: one Lichess latest-game fetch, two predicates, one combined receipt
- Share copy: `I tried a Side Quest Chess combo run: win queenless AND never castle.`
- Result states:
  - all passed: combo success card
  - one passed: partial receipt, no combo bonus
  - none passed: honest fail receipt
  - no username/no game: pending setup state

## Non-goals for the first stack version

- No arbitrary user-created challenge rules.
- No engine evaluation.
- No PGN upload/import.
- No live multiplayer lobby.
- No promises for specified-only challenges.
- No complex score economy beyond additive rewards plus bonus.

## Recommendation

Do not build the full generalized stack builder yet. First ship one opinionated stack — **Queenless + No Castle Club** — because both are already live-backed Lichess verifiers. That gives Side Quest Chess a very shareable new proof loop while keeping the implementation honest and small.

## Acceptance review

This spec defines:

- how combo-quests are selected without confusing the core loop
- scoring and reward rules for stacked quests
- verifier requirements for applying multiple challenge predicates to one game
- UI/copy language for `Quest Stack`, `Combo Run`, and `Bad Idea Pile`
- why this remains a future add-on and not a v1 blocker
