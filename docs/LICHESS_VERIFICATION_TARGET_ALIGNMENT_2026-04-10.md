# CC Lichess Verification Target Alignment

Date: 2026-04-10
Prepared by: Sam
Project: `cc`

## Exact mismatch

The previously written verification slice names `mate-in-one` as the first automation target.

The live shipped challenge catalog in `src/lib/challenges.ts` does not contain `mate-in-one`.
It currently contains only:

- `win-as-white`
- `win-as-black`
- `finish-any-game`

That means the earlier slice points at a non-existent route/catalog item and should not drive the first code implementation unchanged.

## Smallest correct first automation target

Use `finish-any-game` as the first automated verification target.

Why this is the smallest safe target:

- it already exists in the shipped catalog
- its requirement is only `result: "finish"`
- it avoids side-color logic on the first pass
- it only needs to verify that the saved Lichess username appears in the game and that the game is finished
- it produces a real product verdict without inventing a new challenge

## Minimal verification boundary for the first code slice

For a submitted `finish-any-game` attempt:

1. normalize the submitted Lichess game ID
2. fetch the game from Lichess server-side
3. confirm the saved Lichess username matches one player in the game
4. confirm the game is finished
5. persist:
   - `passed` when the identity match and finished-game checks succeed
   - `pending` when the input cannot be verified safely or the fetch fails
   - `failed` only when the game is fetched successfully and the saved username is not one of the players

## Explicit non-goals for this first code slice

Do not add:

- a new `mate-in-one` challenge
- move-sequence validation
- win/loss logic for the first automation pass
- background jobs
- broader challenge-engine abstractions

## Reviewable handoff

The next code item should implement automated verdicts for `finish-any-game` only, using one new Lichess helper plus the existing Clerk metadata attempt flow.

## Verification note

Verified locally on 2026-04-10 with:

```bash
test -f docs/LICHESS_VERIFICATION_TARGET_ALIGNMENT_2026-04-10.md
```
