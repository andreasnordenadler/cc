# SQC Brutal / Absurd Quest Expansion Notes — 2026-05-04

## Product intent
Andreas thinks Brutal and especially Absurd quests may become the most popular/viral tier. I agree: these should feel like streamer bait — the kind of thing Magnus Carlsen, GothamChess, strong titled players, or masochistic club players would attempt because the constraint is hilarious and nearly impossible.

## Tier rules proposal

### Brutal
- Must be genuinely hard for a normal player but plausible in casual/rapid games.
- Should usually require a win.
- Can be unrated or rated unless the quest theme specifically needs rated pressure.
- Should be understandable in one sentence.

### Absurd
- Must feel almost unreasonable.
- Should require a win.
- Strong recommendation: **rated games only** for Absurd quests, or at least a visible `Rated required` marker.
- Should be streamer-friendly: easy to explain, painful to execute, funny to fail.
- Should avoid depending on engine evaluation; prefer objective PGN facts.

## Revisit current hard quests
Current Absurd/Brutal candidates should be audited for:
- Is it hard enough for the label?
- Can it be verified from PGN/public APIs?
- Does it require a win?
- Should it require rated?
- Is the title memorable enough?
- Would someone clip/share an attempt?

## New Brutal quest ideas

1. **King Tourist**
   - Win after your king visits the opponent half of the board before move 30.
   - Objective PGN check: king square rank crosses into opponent half; result win.
   - Difficulty: Brutal.

2. **No Queen, No Mercy**
   - Sacrifice or trade queens by move 10, then win without ever promoting to a queen.
   - Difficulty: Brutal.

3. **The Silent Bishop Pair**
   - Win while both bishops survive until move 35 and neither bishop captures anything before move 20.
   - Difficulty: Brutal.

4. **Rook Lift Regret**
   - Win after moving one rook to the third/sixth rank before move 15 and keeping it alive for at least 10 moves.
   - Difficulty: Brutal.

5. **Pawn Wall**
   - Win with all eight original pawns still on the board after move 20.
   - Difficulty: Brutal.

6. **Castle? Never Met Her**
   - Win without castling, and your king must move at least twice before move 25.
   - Difficulty: Brutal.

## New Absurd quest ideas

1. **Rated Bongcloud Victory**
   - In a rated game, win after playing king move on move 2 (`2.Ke2` / equivalent black-side king move) and survive.
   - Difficulty: Absurd.
   - Very streamer-friendly; obvious Gotham/Magnus bait.

2. **The One-Piece Army**
   - In a rated game, win after losing/trading every minor piece and rook, with only queen + king + pawns as non-king material for the final phase.
   - Difficulty: Absurd.

3. **No Checks Until Mate**
   - In a rated game, win where your first check of the game is checkmate.
   - Difficulty: Absurd.
   - Clean PGN check: no `+`/`#` by player until final `#`.

4. **Underpromotion Clown Car**
   - In a rated game, win after underpromoting to a knight/bishop/rook instead of queen.
   - Difficulty: Absurd.

5. **The Pacifist Opening**
   - In a rated game, make no captures for your first 15 moves and still win.
   - Difficulty: Absurd.

6. **Barely Legal Mate**
   - In a rated game, win by checkmate while down at least 8 points of material immediately before the final move.
   - Difficulty: Absurd, but requires material accounting.

7. **Knightmare Fuel Deluxe**
   - In a rated game, deliver mate with a knight after moving that same knight at least 6 times.
   - Difficulty: Absurd.

8. **The Royal Walk of Shame**
   - In a rated game, win after your king crosses the center and returns home/shelter before the end.
   - Difficulty: Absurd.

## Implementation notes
- Add `requiresRated?: boolean` to challenge metadata.
- Add visible `Rated required` badge for Absurd quests when applicable.
- Update verifier adapters to parse rated/casual flag from Lichess and Chess.com where available.
- Prioritize PGN-objective quests before material-eval quests.
- Consider a dedicated `Absurd` filter and landing/linkable collection for viral sharing.

## Recommendation
Next implementation pass should add 4–6 truly hard Absurd quests first, with rated requirement visible. The best launch candidates are:
1. Rated Bongcloud Victory
2. No Checks Until Mate
3. Underpromotion Clown Car
4. The Pacifist Opening
5. Knightmare Fuel Deluxe
