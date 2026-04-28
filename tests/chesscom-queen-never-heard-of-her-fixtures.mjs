import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeChessComQueenNeverHeardOfHerGame,
} from "../src/lib/chesscom.ts";
import { evaluateQueenNeverHeardOfHer } from "../src/lib/queen-never-heard-of-her.ts";

const syntheticQueenlessWin = {
  url: "https://www.chess.com/game/live/synthetic-queenless-win",
  end_time: 1706476100,
  time_class: "blitz",
  rules: "chess",
  white: { result: "win", username: "and72nor" },
  black: { result: "checkmated", username: "exampleOpponent" },
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. e4 e5 2. Qh5 Nf6 3. Qxf7+ Kxf7 4. Nf3 Nc6 5. Bc4+ Ke8 6. O-O Be7 7. d4 exd4 8. e5 d5 9. exf6 dxc4 10. fxe7 Qxe7 11. Re1 Be6 12. Ng5 Nd8 13. Nxe6 Nxe6 14. Nd2 b5 15. a4 c6 16. axb5 cxb5 17. Ra6 Kf7 18. Ne4 Rhe8 19. Ng5+ Qxg5 20. Bxg5 Nxg5 21. Rxa7+ Rxa7 22. Rxe8 Kxe8 23. h4 Ne4 24. Kh2 Ra2 25. f3 Rxb2 26. fxe4 Rxc2 27. Kg3 d3 28. Kf4 d2 29. Ke5 d1=Q 30. Ke6 Qd7+ 31. Ke5 Rd2 32. g4 Qd6+ 33. Kf5 Rf2+ 34. Kg5 Qh6# 1-0`,
};

const syntheticQueenStaysHome = {
  ...syntheticQueenlessWin,
  url: "https://www.chess.com/game/live/synthetic-queen-stays-home",
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. c3 d6 6. h3 h6 7. Nbd2 a6 8. Bb3 Ba7 9. Nf1 Be6 10. Bxe6 fxe6 11. Be3 Bxe3 12. Nxe3 O-O 13. Qb3 Qc8 14. Qc2 Kh8 15. g4 1-0`,
};

test("Chess.com Queen? Never Heard of Her normalizer derives queen capture order from PGN", () => {
  const game = normalizeChessComQueenNeverHeardOfHerGame(syntheticQueenlessWin, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/synthetic-queenless-win");
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.variant, "standard");
  assert.ok(game.captures.some((capture) => capture.ply === 6 && capture.capturedPiece === "queen" && capture.capturedColor === "white"));

  const verdict = evaluateQueenNeverHeardOfHer(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Queen lost before move 15/);
});

test("Chess.com Queen? Never Heard of Her fails when the player queen never disappears", () => {
  const game = normalizeChessComQueenNeverHeardOfHerGame(syntheticQueenStaysHome, "and72nor");

  assert.ok(game);
  const verdict = evaluateQueenNeverHeardOfHer(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /No player queen loss/);
});
