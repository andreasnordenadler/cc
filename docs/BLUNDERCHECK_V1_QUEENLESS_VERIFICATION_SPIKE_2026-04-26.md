# BlunderCheck v1 — Queenless Verification Spike

Date: 2026-04-26 11:40 Europe/Stockholm  
Owner: Sam

## What shipped locally

Implemented the first rule-backed verification slice for the canonical v1 challenge:

**Queen? Never Heard of Her** — win after losing your queen before move 15 while the opponent still has theirs.

Files:
- `src/lib/queen-never-heard-of-her.ts`
- `tests/queen-never-heard-of-her-fixtures.mjs`
- `src/app/actions.ts`

## Verification behavior

The checker evaluates a provider-normalized game timeline:

- standard chess only
- bullet/blitz/rapid or unknown time class only
- game must reach at least 10 moves
- player must win
- player's queen must be captured before move 15
- opponent queen must still be present at that moment

The account “check latest games” placeholder now uses the real queenless rule checker against deterministic fixtures for the canonical challenge, instead of pure hand-written status text.

## Fixtures

Repeatable fixture coverage includes:

1. `fixture-queenless-win` — passes: queen lost on move 9, opponent queen still present, player wins.
2. `fixture-queen-stayed-home` — fails: player queen was never lost.
3. `fixture-traded-queens-first` — fails: opponent queen was already gone before/at the proof moment.

## Feasibility note

The smallest reliable v1 path is not PGN upload and not engine analysis. It is:

1. Fetch recent games from Lichess / Chess.com APIs.
2. Normalize each game into a capture timeline plus metadata.
3. Run challenge-specific rule checkers on the normalized timeline.
4. Show the best recent pass/fail proof in BlunderCheck.

This keeps the product aligned with “play real games elsewhere; BlunderCheck checks them automatically.”

Open limitation: the current spike assumes a normalized capture feed. The next integration step is an adapter that turns provider game data into that feed, starting with the easiest public API surface.

## Proof

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- local route smoke on running dev server:
  - `/` 200 and contains `BlunderCheck`
  - `/challenges` 200 and contains `Pick your next bad idea`
  - `/challenges/queen-never-heard-of-her` 200 and contains `Queen? Never Heard of Her`
  - `/account` 200 and contains `Active challenge checker`
