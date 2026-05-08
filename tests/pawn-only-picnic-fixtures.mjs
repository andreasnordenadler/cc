import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProofPositionFromUciMoves } from "../src/lib/chess-proof.ts";
import {
  evaluatePawnOnlyPicnic,
  normalizeLichessPawnOnlyPicnicGame,
  pawnOnlyPicnicFixtures,
} from "../src/lib/pawn-only-picnic.ts";

const pawnPicnicUci = "a2a3 a7a6 h2h3 h7h6 b2b3 b7b6 g2g3 g7g6 c2c3 c7c6 f2f3 f7f6 d2d3 d7d6 e2e3 e7e6 b1d2 b8d7 g1e2 g8e7 c1b2 c8b7 d1c2 d8c7 e1c1 e8c8 c1b1 c8b8 c2c3 c7c6 c3c6 b7c6";

const lichessPawnPicnicWin = {
  id: "lichess-pawn-picnic-win",
  rated: true,
  speed: "blitz",
  perf: "blitz",
  variant: "standard",
  winner: "white",
  players: {
    white: { user: { name: "and72nor" } },
    black: { user: { name: "exampleOpponent" } },
  },
  moves: pawnPicnicUci,
};

const lichessKnightCrash = {
  ...lichessPawnPicnicWin,
  id: "lichess-knight-crash",
  moves: "a2a3 a7a6 h2h3 h7h6 b1c3 b7b6 g2g3 g7g6 c2c3 c7c6 f2f3 f7f6 d2d3 d7d6 e2e3 e7e6",
};

test("Pawn-Only Picnic evaluates fixture pass/fail/loss cases", () => {
  assert.equal(evaluatePawnOnlyPicnic(pawnOnlyPicnicFixtures[0]).status, "passed");
  assert.equal(evaluatePawnOnlyPicnic(pawnOnlyPicnicFixtures[1]).status, "failed");
  assert.match(evaluatePawnOnlyPicnic(pawnOnlyPicnicFixtures[1]).summary, /grown-up piece/);
  assert.equal(evaluatePawnOnlyPicnic(pawnOnlyPicnicFixtures[2]).status, "failed");
  assert.match(evaluatePawnOnlyPicnic(pawnOnlyPicnicFixtures[2]).summary, /player wins/);
});

test("Lichess Pawn-Only Picnic normalizer tracks first eight player moves from UCI", () => {
  const game = normalizeLichessPawnOnlyPicnicGame(lichessPawnPicnicWin, "and72nor");

  assert.ok(game);
  assert.equal(game.playerColor, "white");
  assert.equal(game.winner, "white");
  assert.deepEqual(game.firstEightPlayerMovePieces, ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"]);

  const verdict = evaluatePawnOnlyPicnic(game);
  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /Pawn-only opening confirmed/);
});

test("Lichess Pawn-Only Picnic rejects an early non-pawn move", () => {
  const game = normalizeLichessPawnOnlyPicnicGame(lichessKnightCrash, "and72nor");

  assert.ok(game);
  assert.deepEqual(game.firstEightPlayerMovePieces.slice(0, 3), ["pawn", "pawn", "knight"]);
  assert.equal(evaluatePawnOnlyPicnic(game).status, "failed");
});

test("Pawn-Only Picnic proof receipt can carry a final board image position", () => {
  const proofPosition = buildProofPositionFromUciMoves(pawnPicnicUci);

  assert.ok(proofPosition);
  assert.equal(proofPosition.lastMoveUci, "b7c6");
  assert.match(proofPosition.finalPositionFen, /^1k1r1b1r\/3nn3\/ppbppppp\/8\/8\/PP1PPPPP\/1B1NN3\/1K1R1B1R/);
});
