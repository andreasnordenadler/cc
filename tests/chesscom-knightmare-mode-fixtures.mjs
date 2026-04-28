import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeChessComKnightmareModeGame } from "../src/lib/chesscom.ts";
import { evaluateKnightmareMode } from "../src/lib/knightmare-mode.ts";

const syntheticKnightMateWin = {
  url: "https://www.chess.com/game/live/synthetic-knightmare-mode-win",
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

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 h6 5. a3 a6 6. h3 h5 7. d3 d6 8. c3 Be7 9. b3 O-O 10. Nxf7# 1-0`,
};

const syntheticBishopMateWin = {
  ...syntheticKnightMateWin,
  url: "https://www.chess.com/game/live/synthetic-bishop-mate-win",
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 h6 5. a3 a6 6. h3 h5 7. d3 d6 8. c3 Be7 9. b3 O-O 10. Bxf7# 1-0`,
};

test("Chess.com Knightmare Mode normalizer detects a final knight checkmate move from PGN", () => {
  const game = normalizeChessComKnightmareModeGame(syntheticKnightMateWin, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/synthetic-knightmare-mode-win");
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.status, "mate");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.variant, "standard");
  assert.deepEqual(game.finalMove, { ply: 19, color: "white", from: "g5", to: "f7", piece: "knight" });

  const verdict = evaluateKnightmareMode(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Knight checkmate confirmed/);
});

test("Chess.com Knightmare Mode fails when checkmate came from a bishop", () => {
  const game = normalizeChessComKnightmareModeGame(syntheticBishopMateWin, "and72nor");

  assert.ok(game);
  assert.deepEqual(game.finalMove, { ply: 19, color: "white", from: "c4", to: "f7", piece: "bishop" });

  const verdict = evaluateKnightmareMode(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /not a knight/);
});
