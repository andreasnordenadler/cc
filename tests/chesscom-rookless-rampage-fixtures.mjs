import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeChessComRooklessRampageGame } from "../src/lib/chesscom.ts";
import { evaluateRooklessRampage } from "../src/lib/rookless-rampage.ts";

const syntheticRooklessWin = {
  url: "https://www.chess.com/game/live/synthetic-rookless-rampage-win",
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

1. a4 d5 2. Ra3 Qd6 3. h4 Qxa3 4. Rh3 Qxh3 5. Nxh3 e5 6. g3 Nc6 7. Bg2 Nf6 8. O-O Bd6 9. Ba3 Bxa3 10. Nxa3 O-O 11. Nb5 Bxh3 12. Bxh3 a6 13. Nxc7 Rad8 14. Qb1 e4 15. Qxb7 Nd4 16. e3 Nf3+ 17. Kg2 Nxd2 18. Rd1 Nf3 19. Nxd5 Nxd5 20. Rxd5 Rb8 21. Qe7 Rb1 22. Qxe4 Ne1+ 23. Kh2 Nf3+ 24. Qxf3 1-0`,
};

const syntheticOneRookSurvived = {
  ...syntheticRooklessWin,
  url: "https://www.chess.com/game/live/synthetic-one-rook-survived",
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. a4 d5 2. Ra3 Qd6 3. h4 Qxa3 4. Nxa3 e5 5. g3 Nc6 6. Bg2 Nf6 7. O-O Bd6 8. Ba3 Bxa3 9. Rxa3 O-O 10. Nb5 a6 11. Nxc7 Rb8 12. Nxd5 Nxd5 13. Bxd5 Rd8 14. c4 Be6 15. Bxe6 fxe6 16. d3 e4 17. Qb3 exd3 18. exd3 Nd4 19. Qb2 Nf3+ 20. Kg2 Rxd3 21. Rxd3 Ne1+ 22. Kh3 Nxd3 23. Qd4 1-0`,
};

test("Chess.com Rookless Rampage normalizer tracks both original rooks from PGN", () => {
  const game = normalizeChessComRooklessRampageGame(syntheticRooklessWin, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/synthetic-rookless-rampage-win");
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.variant, "standard");
  assert.deepEqual(
    game.rookLosses.filter((loss) => loss.color === "white").map((loss) => [loss.origin, loss.square, loss.ply]),
    [["a1", "a3", 6], ["h1", "h3", 8]],
  );

  const verdict = evaluateRooklessRampage(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Rookless Rampage confirmed/);
});

test("Chess.com Rookless Rampage fails when only one original rook is lost", () => {
  const game = normalizeChessComRooklessRampageGame(syntheticOneRookSurvived, "and72nor");

  assert.ok(game);
  const verdict = evaluateRooklessRampage(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /Only 1\/2 original rooks/);
});
