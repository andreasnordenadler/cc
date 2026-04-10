# CC Lichess Black Win Verification Slice

Date: 2026-04-10
Owner: Sam

## Goal

Define the smallest next reviewable automation step after `win-as-white`: add a real automated verdict for exactly one existing black-side win challenge.

## Exact next target

Use `win-as-black` as the next automation target.

Why this one next:
- it reuses the same server-side Lichess fetch path already shipping for `finish-any-game` and `win-as-white`
- it does not need any new external fields beyond the data already used for `win-as-white`
- it completes the current shipped challenge catalog's only remaining side-specific win verifier without expanding scope

## Minimum Lichess data needed

The current verifier path already reads enough data:
- game status
- white player username
- black player username
- `winner`

No additional Lichess fields are required for this slice.

## Strict verification boundary

For a submitted `win-as-black` attempt:

1. normalize the submitted game ID
2. fetch the game from Lichess server-side
3. confirm the saved username appears in the game
4. confirm the user is the Black player
5. confirm the game is finished
6. confirm `winner === "black"`
7. persist one of these verdicts:
   - `passed`: username is Black and Black won a finished game
   - `failed`: username appears, game is finished, but the user was not Black or Black did not win
   - `pending`: username missing, game still in progress, or Lichess fetch is temporarily unavailable

## Explicit deferrals

Do not include any of this in the next slice:
- challenge-agnostic verifier rewrites beyond the minimum needed to keep code clear
- richer account/challenge UI changes unrelated to verdict persistence
- retries, cron rechecks, or async reconciliation
- opening validation, move analysis, or move-count rules
- streaks, rewards expansion, or broader progression features
- historical backfill of old attempts

## Reviewable implementation shape

The next code item should stay narrow:
- extend the current Lichess verifier usage in `src/lib/lichess.ts` only as needed for `win-as-black`
- update `src/app/actions.ts` to call the verifier for `win-as-black`
- leave the rest of the challenge loop unchanged

## Acceptance for the next code slice

A signed-in user with a saved Lichess username can submit a finished game for `win-as-black` and then see a persisted automated verdict of `passed`, `failed`, or `pending` after refresh.

## Verification note

Artifact created and verified locally on 2026-04-10 with:

```bash
test -f docs/LICHESS_BLACK_WIN_VERIFICATION_SLICE_2026-04-10.md
```
