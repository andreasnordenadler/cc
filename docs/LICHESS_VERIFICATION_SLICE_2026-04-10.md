# CC Lichess Verification Slice

Date: 2026-04-10
Prepared by: Sam
Project: `cc`

## Purpose

Define the smallest reviewable next product slice after the live Clerk cutover: turn one submitted Lichess game ID into a basic server-side pass or fail verdict for one starter challenge.

## Current product baseline

Today the app already supports:

- signing in with Clerk
- saving a Lichess username
- starting a challenge
- submitting a finished Lichess game ID or URL
- storing a pending/manual-review placeholder in Clerk public metadata
- rendering latest-attempt status plus attempt history on `/challenges/[id]` and `/account`

The missing product step is automated verification.

## Smallest shippable verification slice

Implement automated verification for exactly one challenge first: `mate-in-one`.

### Input already available

From current metadata and forms, the app already has:

- `challengeId`
- submitted `gameId`
- saved `lichessUsername`
- active challenge context
- persistent attempt history in Clerk public metadata

### New server behavior

For a submitted `mate-in-one` attempt:

1. Normalize the Lichess game ID from the submitted value.
2. Fetch the game from Lichess in a server action or server helper.
3. Confirm the game belongs to the saved Lichess username.
4. Confirm the game is finished.
5. Produce a simple first-pass verdict:
   - `passed` when the saved player won the game
   - `failed` when the saved player lost or drew
   - `pending` only when the fetch or input cannot be verified safely
6. Persist the verdict back into the existing Clerk metadata attempt record.
7. Update the active challenge status to match the verdict.

## Why this exact slice

It is the shortest path from the current placeholder loop to a real product claim without expanding scope into full chess analysis.

- no new database is required
- no admin UI is required
- no challenge authoring is required
- no deep move-by-move validation is required yet

## Explicit deferrals

Do not include these in the first verification slice:

- move-sequence or puzzle-shape validation
- opening recognition
- engine analysis
- support for every challenge type
- background jobs or retries
- public leaderboard or scoring changes beyond the existing reward model

## Proposed implementation boundary

### Likely files

- `src/app/actions.ts`
- `src/lib/user-metadata.ts`
- one new helper such as `src/lib/lichess.ts`
- `src/app/challenges/[id]/page.tsx`

### UI expectation

Keep the current UI shape. Only replace the manual-review placeholder with a clearer automated verdict when available.

## Acceptance for the future code item

A signed-in user with a saved Lichess username can submit a finished game for `mate-in-one` and then see a persisted automated verdict of `passed`, `failed`, or `pending` on refresh.

## Proof note

Artifact created to define the next minimal product slice while the live Clerk production cutover remains blocked.
