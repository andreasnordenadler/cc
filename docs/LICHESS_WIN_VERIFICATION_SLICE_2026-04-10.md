# CC Lichess Win Verification Slice

Date: 2026-04-10
Owner: Sam

## Goal

Define the smallest next reviewable automation step after `finish-any-game`: add a real automated verdict for exactly one existing win-based challenge.

## Exact next target

Use `win-as-white` as the next automation target.

Why this one first:
- it reuses the existing game-fetch path already shipped for `finish-any-game`
- it only adds one new rule boundary beyond "finished game with matching username": the user must appear as White and the game result must be a win
- it keeps the next code slice smaller than solving both color-specific win challenges at once

## Minimum extra Lichess data needed

The current verifier already reads:
- game status
- white player username
- black player username

The next slice only needs these extra fields from the same game export:
- `winner`

That is enough to decide whether the saved user both:
1. appears in the game as White
2. won the finished game

## Strict verification boundary

For a submitted `win-as-white` attempt:

1. normalize the submitted game ID
2. fetch the game from Lichess server-side
3. confirm the saved username appears in the game
4. confirm the user is the White player
5. confirm the game is finished
6. confirm `winner === "white"`
7. persist one of these verdicts:
   - `passed`: username is White and White won a finished game
   - `failed`: username appears, game is finished, but the user was not White or White did not win
   - `pending`: username missing, game still in progress, or Lichess fetch is temporarily unavailable

## Explicit deferrals

Do not include any of this in the next slice:
- `win-as-black`
- shared multi-challenge refactors beyond what is needed for one clean verifier
- richer UI states, badges, or copy rewrites unrelated to the new verdict
- retries, queues, cron rechecks, or background reconciliation
- engine analysis, opening validation, or move-level inspection
- historical backfill of old attempts

## Reviewable implementation shape

The next code item should stay narrow:
- extend `src/lib/lichess.ts` with one win-aware verifier for `win-as-white`
- update `src/app/actions.ts` to call that verifier only for `win-as-white`
- leave `win-as-black` on the current narrower pending/manual path for now

## Acceptance for the next code slice

A signed-in user with a saved Lichess username can submit a finished game for `win-as-white` and then see a persisted automated verdict of `passed`, `failed`, or `pending` after refresh.

## Verification note

Artifact created and verified locally on 2026-04-10 with:

```bash
test -f docs/LICHESS_WIN_VERIFICATION_SLICE_2026-04-10.md
```
