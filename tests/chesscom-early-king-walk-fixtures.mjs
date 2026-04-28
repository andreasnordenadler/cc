import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeChessComEarlyKingWalkGame } from "../src/lib/chesscom.ts";
import { evaluateEarlyKingWalk } from "../src/lib/early-king-walk.ts";

const observedAnd72NorLatestGame = {
  url: "https://www.chess.com/game/live/100214634859",
  end_time: 1706476100,
  time_class: "blitz",
  rules: "chess",
  white: { result: "win", username: "mohamedamash" },
  black: { result: "checkmated", username: "and72nor" },
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.28"]
[White "mohamedamash"]
[Black "and72nor"]
[Result "1-0"]
[TimeControl "300+5"]
[Link "https://www.chess.com/game/live/100214634859"]

1. e4 {[%clk 0:05:04.9]} 1... c6 {[%clk 0:05:02.7]} 2. Bc4 {[%clk 0:05:06.2]} 2... e6 {[%clk 0:05:06.6]} 3. a3 {[%clk 0:05:09.1]} 3... Bc5 {[%clk 0:05:08.2]} 4. Nf3 {[%clk 0:05:11.8]} 4... a6 {[%clk 0:05:11.8]} 5. h3 {[%clk 0:05:15.3]} 5... d5 {[%clk 0:05:12.4]} 6. exd5 {[%clk 0:05:18.8]} 6... cxd5 {[%clk 0:05:14.7]} 7. Ba2 {[%clk 0:05:23.6]} 7... Nc6 {[%clk 0:05:11.5]} 8. d4 {[%clk 0:05:26.7]} 8... Ba7 {[%clk 0:05:10.3]} 9. Be3 {[%clk 0:05:25]} 9... b5 {[%clk 0:05:13.5]} 10. b3 {[%clk 0:05:27]} 10... Bb7 {[%clk 0:05:17.4]} 11. c4 {[%clk 0:05:31.2]} 11... bxc4 {[%clk 0:05:20.5]} 12. bxc4 {[%clk 0:05:35.1]} 12... dxc4 {[%clk 0:05:20.6]} 13. Bxc4 {[%clk 0:05:38.3]} 13... Nf6 {[%clk 0:05:13.3]} 14. O-O {[%clk 0:05:40.4]} 14... Ne4 {[%clk 0:05:16.2]} 15. d5 {[%clk 0:05:01.9]} 15... exd5 {[%clk 0:05:11.1]} 16. Bxd5 {[%clk 0:05:05.4]} 16... Nd6 {[%clk 0:05:03.2]} 17. Nc3 {[%clk 0:04:56.5]} 17... O-O {[%clk 0:05:05.6]} 18. Ng5 {[%clk 0:04:35.5]} 18... Bxe3 {[%clk 0:05:01.9]} 19. Nxh7 {[%clk 0:04:08.7]} 19... Bxf2+ {[%clk 0:04:52.9]} 20. Rxf2 {[%clk 0:04:11.2]} 20... Kxh7 {[%clk 0:04:56.1]} 21. Qh5+ {[%clk 0:04:15.5]} 21... Kg8 {[%clk 0:04:49.9]} 22. Rf4 {[%clk 0:04:19.4]} 22... g6 {[%clk 0:04:36.2]} 23. Qh6 {[%clk 0:04:22.2]} 23... Ne5 {[%clk 0:04:20.6]} 24. Bxb7 {[%clk 0:04:22.7]} 24... Rb8 {[%clk 0:04:15.4]} 25. Rh4 {[%clk 0:04:25.1]} 25... Qf6 {[%clk 0:03:45]} 26. Qh7# {[%clk 0:04:26.9]} 1-0`,
};

const syntheticEarlyKingWalkWin = {
  url: "https://www.chess.com/game/live/synthetic-early-king-walk-win",
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

1. e4 e5 2. Ke2 Nc6 3. Nf3 Nf6 4. d3 Be7 5. Be3 O-O 6. Nc3 d6 7. Qd2 1-0`,
};

const syntheticCastleIsNotWalk = {
  url: "https://www.chess.com/game/live/synthetic-castle-is-not-walk",
  end_time: 1706476100,
  time_class: "rapid",
  rules: "chess",
  white: { result: "win", username: "and72nor" },
  black: { result: "checkmated", username: "exampleOpponent" },
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7 4. O-O Nf6 5. d3 O-O 6. Nc3 d6 7. Be3 Be6 8. Qd2 1-0`,
};

test("Chess.com Early King Walk normalizer uses observed and72nor archive shape", () => {
  const game = normalizeChessComEarlyKingWalkGame(observedAnd72NorLatestGame, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/100214634859");
  assert.equal(game.playerColor, "black");
  assert.equal(game.winner, "white");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.variant, "standard");
  assert.equal(game.earlyKingWalkMove, 20);
  assert.equal(game.castledBeforeKingWalk, true);

  const verdict = evaluateEarlyKingWalk(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /Early King Walk only counts|monarch did not take/);
});

test("Chess.com Early King Walk can verify a pre-move-12 non-castling king move", () => {
  const game = normalizeChessComEarlyKingWalkGame(syntheticEarlyKingWalkWin, "and72nor");

  assert.ok(game);
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.earlyKingWalkMove, 2);
  assert.equal(game.castledBeforeKingWalk, false);

  const verdict = evaluateEarlyKingWalk(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Early king walk confirmed/);
});

test("Chess.com Early King Walk treats castling as not walking", () => {
  const game = normalizeChessComEarlyKingWalkGame(syntheticCastleIsNotWalk, "and72nor");

  assert.ok(game);
  assert.equal(game.castledBeforeKingWalk, true);
  assert.equal(game.earlyKingWalkMove, undefined);

  const verdict = evaluateEarlyKingWalk(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.evidence.join(" "), /Castling happened/);
});
