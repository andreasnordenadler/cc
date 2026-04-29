import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeChessComBlunderGambitGame } from "../src/lib/chesscom.ts";
import { evaluateBlunderGambit } from "../src/lib/the-blunder-gambit.ts";

const syntheticBlunderWin = {
  url: "https://www.chess.com/game/live/synthetic-blunder-win",
  end_time: 1706476200,
  time_class: "blitz",
  rules: "chess",
  white: { result: "win", username: "and72nor" },
  black: { result: "checkmated", username: "exampleOpponent" },
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. d3 Bc5 4. Bxf7+ Kxf7 5. Nf3 d6 6. O-O Nf6 7. Nc3 h6 8. Be3 Bg4 9. Qe1 Re8 10. Nh4 Be6 11. f4 Kg8 12. f5 Bf7 13. Qg3 Qe7 14. Rae1 Rf8 15. Nd5 Qd8 16. c3 1-0`,
};

const syntheticQuietOpening = {
  ...syntheticBlunderWin,
  url: "https://www.chess.com/game/live/synthetic-quiet-opening",
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. Bg5 Bg7 16. Qd2 1-0`,
};

test("Chess.com Blunder Gambit normalizer tracks early unbalanced material hangs from PGN", () => {
  const game = normalizeChessComBlunderGambitGame(syntheticBlunderWin, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/synthetic-blunder-win");
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.timeClass, "blitz");
  assert.ok(game.captures.some((capture) => capture.capturedColor === "white" && capture.capturedPiece === "bishop"));

  const verdict = evaluateBlunderGambit(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Early material hang/);
});

test("Chess.com Blunder Gambit fails when no early player minor/rook loss exists", () => {
  const game = normalizeChessComBlunderGambitGame(syntheticQuietOpening, "and72nor");

  assert.ok(game);
  const verdict = evaluateBlunderGambit(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.evidence.join(" "), /No player knight, bishop, or rook/);
});
