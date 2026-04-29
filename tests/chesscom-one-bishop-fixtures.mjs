import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeChessComOneBishopToRuleThemAllGame } from "../src/lib/chesscom.ts";
import { evaluateOneBishopToRuleThemAll } from "../src/lib/one-bishop-to-rule-them-all.ts";

const syntheticOneBishopWin = {
  url: "https://www.chess.com/game/live/synthetic-one-bishop-win",
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

1. Nf3 d5 2. Ng5 e5 3. Nxf7 Kxf7 4. Bc4 dxc4 5. Nc3 Nf6 6. Nd5 Nxd5 7. g3 Nc6 8. O-O Be6 9. e3 Qd7 10. Qf3+ Kg8 11. d3 cxd3 12. cxd3 Be7 13. Bd2 Rf8 14. Qe2 h5 15. Rac1 h4 16. Rxc6 bxc6 17. Rc1 1-0`,
};

const syntheticTooManyMinors = {
  ...syntheticOneBishopWin,
  url: "https://www.chess.com/game/live/synthetic-too-many-minors",
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. Nf3 d5 2. g3 Nf6 3. Bg2 e6 4. O-O Be7 5. d3 O-O 6. Nbd2 c5 7. e4 Nc6 8. Re1 b6 9. e5 Nd7 10. Nf1 Bb7 11. h4 Qc7 12. Bf4 Rac8 13. N1h2 Rfd8 14. Ng4 Nf8 15. h5 h6 16. Qd2 1-0`,
};

test("Chess.com One Bishop normalizer tracks final minor pieces from PGN", () => {
  const game = normalizeChessComOneBishopToRuleThemAllGame(syntheticOneBishopWin, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/synthetic-one-bishop-win");
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.variant, "standard");
  assert.deepEqual(game.finalMinorPieces, [{ kind: "bishop", square: "d2" }]);

  const verdict = evaluateOneBishopToRuleThemAll(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /One Bishop to Rule Them All confirmed/);
});

test("Chess.com One Bishop fails when extra minor pieces remain", () => {
  const game = normalizeChessComOneBishopToRuleThemAllGame(syntheticTooManyMinors, "and72nor");

  assert.ok(game);
  assert.ok(game.finalMinorPieces.length > 1);
  const verdict = evaluateOneBishopToRuleThemAll(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /not lonely enough/);
});
