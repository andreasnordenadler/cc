import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeChessComPawnStormManiacGame } from "../src/lib/chesscom.ts";
import { evaluatePawnStormManiac } from "../src/lib/pawn-storm-maniac.ts";

const syntheticSixPawnStormWin = {
  url: "https://www.chess.com/game/live/880001",
  end_time: 1706476100,
  time_class: "blitz",
  rules: "chess",
  white: { result: "win", username: "and72nor" },
  black: { result: "resigned", username: "exampleOpponent" },
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. a4 e5 2. b4 Nc6 3. c4 Nf6 4. d4 exd4 5. e4 Bxb4+ 6. Nd2 O-O 7. Bd3 Re8 8. f4 d6 9. Nf3 Bg4 10. O-O Qd7 11. Ba3 Bxa3 12. Rxa3 Re7 13. Qb1 Rae8 14. h3 Bxf3 15. Rxf3 b6 16. Kh2 h6 17. Rg3 Nh5 18. Rf3 Nf6 19. Rf1 Nh5 20. Qd1 Nf6 21. Qf3 Qe6 22. Raa1 Nb4 23. Rae1 Nxd3 24. Qxd3 c5 25. e5 dxe5 26. fxe5 Nd7 27. Nf3 Qg6 28. Qxg6 fxg6 29. e6 Rxe6 30. Rxe6 Rxe6 31. Re1 Rxe1 32. Nxe1 1-0`,
};

const syntheticFivePawnDrizzle = {
  ...syntheticSixPawnStormWin,
  url: "https://www.chess.com/game/live/880002",
  pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[White "and72nor"]
[Black "exampleOpponent"]
[Result "1-0"]

1. a4 e5 2. b4 Nc6 3. c4 Nf6 4. d4 exd4 5. e4 Bxb4+ 6. Nd2 O-O 7. Bd3 Re8 8. Nf3 d6 9. O-O Bg4 10. Ba3 Bxa3 11. Rxa3 Qd7 12. Re1 Ne5 13. Qb1 c5 14. Kh1 Bxf3 15. Nxf3 Nxf3 16. gxf3 Qh3 17. Bf1 Qh4 18. Bg2 Nh5 19. Qxb7 Nf4 20. Qd7 Re6 21. Qb7 Rae8 22. Kg1 1-0`,
};

test("Chess.com Pawn Storm Maniac normalizer derives six early pawn starts from PGN", () => {
  const game = normalizeChessComPawnStormManiacGame(syntheticSixPawnStormWin, "and72nor");

  assert.ok(game);
  assert.equal(game.id, "https://www.chess.com/game/live/880001");
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.variant, "standard");
  assert.deepEqual(game.pawnMoves.filter((move) => move.color === "white").slice(0, 6).map((move) => move.from), ["a2", "b2", "c2", "d2", "e2", "f2"]);

  const verdict = evaluatePawnStormManiac(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Six-pawn storm confirmed/);
});

test("Pawn Storm counts original pawn identities after captures", () => {
  const verdict = evaluatePawnStormManiac({
    id: "original-pawn-identity",
    playerColor: "white",
    winner: "white",
    moveCount: 20,
    variant: "standard",
    timeClass: "blitz",
    pawnMoves: [
      { ply: 1, color: "white", from: "a2", to: "a4", pawnFile: "a" },
      { ply: 3, color: "white", from: "b2", to: "b4", pawnFile: "b" },
      { ply: 5, color: "white", from: "c2", to: "c4", pawnFile: "c" },
      { ply: 7, color: "white", from: "d2", to: "d4", pawnFile: "d" },
      { ply: 9, color: "white", from: "e2", to: "e4", pawnFile: "e" },
      { ply: 11, color: "white", from: "e4", to: "d5", pawnFile: "e" },
      { ply: 13, color: "white", from: "d5", to: "d6", pawnFile: "e" },
    ],
  });

  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /Only 5 different player pawns/);
});

test("Chess.com Pawn Storm Maniac fails when only five different pawns move before move 15", () => {
  const game = normalizeChessComPawnStormManiacGame(syntheticFivePawnDrizzle, "and72nor");

  assert.ok(game);
  const verdict = evaluatePawnStormManiac(game);
  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /Only 5 different player pawns/);
});
