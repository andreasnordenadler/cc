# SQC Completed Quest Chessboard / Last Move Notes — 2026-05-04

## Request
When a user fulfills a quest and only the win/final move remains, show a chessboard and the last move / completion moment.

## Interpretation
For completed quests, SQC should display a proof board snapshot:
- final position or key quest-satisfying position
- highlight the last move
- show the exact move that completed the quest/win
- connect the visual board to the receipt/badge moment

## UX concept
On successful refresh/completion:
- Latest receipt card shows `Quest completed`.
- Add board preview below receipt:
  - final board position
  - arrow/highlight for last move
  - SAN notation, provider, game link
  - `Share proof` CTA

## Technical approach
1. Parse PGN from Lichess/Chess.com latest game response.
2. Use chess.js to replay the game.
3. Store proof snapshot in attempt/completion metadata:
   - final FEN
   - lastMove SAN
   - lastMove from/to squares if available
   - provider game URL
   - completedAt
4. Render with a lightweight board component.

## Dependency recommendation
- `chess.js` for PGN/FEN/move replay.
- For board UI either:
  - custom CSS grid board (fast, controllable, good enough for proof snapshots), or
  - a React chessboard package if license/size checks out.

Recommendation: start with custom static CSS board for proof snapshots. We do not need drag/drop.

## Edge cases
- Some quests may be fulfilled before final move; still show final move/win, plus quest evidence in receipt.
- If PGN parse fails, show textual receipt fallback.
- For checkmate quests, highlight mating move.
- For non-checkmate wins/resignations, highlight last move before result if present.

## Roadmap recommendation
Implement after provider refresh metadata supports storing provider/game IDs reliably. This pairs naturally with global completion storage and shareable proof cards.
