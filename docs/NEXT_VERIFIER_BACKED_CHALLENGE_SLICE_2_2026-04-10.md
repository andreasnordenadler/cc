# CC Next Verifier-Backed Challenge Slice 2

Date: 2026-04-10
Owner: Sam

## Goal

Define the smallest post-catalog challenge expansion now that the live four-challenge catalog already has real automated Lichess verdicts.

## Exact next challenge to add

Add `finish-as-black` as the next verifier-backed challenge.

## Why this is the smallest reviewable next step

- it grows the catalog by exactly one challenge
- it reuses the same finished-game verification path already shipped for `finish-any-game` and `finish-as-white`
- it reuses player-color evidence already read for `finish-as-white` and `win-as-black`
- it completes the missing side-pair for the existing finish challenge family without changing challenge semantics
- it does not require new UI patterns, background jobs, or external integrations

## Minimum Lichess evidence to reuse

The current verifier path already has everything needed:

- game status
- white player username
- black player username

No new Lichess fields are required for this slice.

## Strict verification boundary

For a submitted `finish-as-black` attempt:

1. normalize the submitted game ID
2. fetch the game from Lichess server-side
3. confirm the saved username appears in the game
4. confirm the user is the Black player
5. confirm the game is finished
6. persist one of these verdicts:
   - `passed`: username is Black in a finished game
   - `failed`: username appears in a finished game, but the user was not Black
   - `pending`: username missing, game still in progress, or Lichess fetch is temporarily unavailable

## Explicit deferrals

Do not include any of this in the next slice:

- adding more than one new challenge
- challenge packs, streaks, or reward-system changes
- richer challenge filtering or sorting UI
- retries, cron rechecks, or async reconciliation
- move-quality analysis, openings, or move-count constraints
- leaderboard, social, or coach features

## Reviewable implementation shape

The next code slice should stay narrow:

- add `finish-as-black` to `src/lib/challenges.ts`
- extend `src/lib/lichess.ts` only as needed to verify a side-specific finished-game challenge if needed
- wire `src/app/actions.ts` to persist the real verdict for `finish-as-black`
- leave the rest of the product loop unchanged

## Acceptance for the next code slice

A signed-in user with a saved Lichess username can submit a finished game for `finish-as-black` and then see a persisted automated verdict of `passed`, `failed`, or `pending` after refresh.

## Verification note

Artifact created and verified locally on 2026-04-10 with:

```bash
test -f docs/NEXT_VERIFIER_BACKED_CHALLENGE_SLICE_2_2026-04-10.md
```
