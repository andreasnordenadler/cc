import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateOneBishopToRuleThemAll,
  normalizeLichessOneBishopToRuleThemAllGame,
  oneBishopToRuleThemAllFixtures,
} from "../src/lib/one-bishop-to-rule-them-all.ts";

test("passes when exactly one bishop remains as the player's only final minor piece in a win", () => {
  const verdict = evaluateOneBishopToRuleThemAll(oneBishopToRuleThemAllFixtures[0]);

  assert.equal(verdict.status, "passed");
  assert.match(verdict.summary, /One Bishop to Rule Them All confirmed/);
});

test("fails when another minor piece survives", () => {
  const verdict = evaluateOneBishopToRuleThemAll(oneBishopToRuleThemAllFixtures[1]);

  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /not lonely enough/);
});

test("fails when the one-bishop player does not win", () => {
  const verdict = evaluateOneBishopToRuleThemAll(oneBishopToRuleThemAllFixtures[2]);

  assert.equal(verdict.status, "failed");
  assert.match(verdict.summary, /also wins/);
});

test("normalizes Lichess UCI moves into final minor-piece evidence", () => {
  const game = normalizeLichessOneBishopToRuleThemAllGame(
    {
      id: "lichess-one-bishop-shape",
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "DiagonalBoss" } },
        black: { user: { name: "Opponent" } },
      },
      moves: "g1f3 b8c6 f3e5 c6e5 b1c3 g8f6 c3b5 f6e4 b5d6 e4d6 f1b5 c8g4 b5c6 d7c6 c1b2 a7a6 e2e4 a6a5 d2d3 a5a4 b2c3 a4a3 c3b2 a3a2 b2c3 a2a1q c3b2 h7h6 b2c3 h6h5 c3b2", 
    },
    "diagonalboss",
  );

  assert.ok(game);
  assert.deepEqual(game.finalMinorPieces, [{ kind: "bishop", square: "b2" }]);

  const verdict = evaluateOneBishopToRuleThemAll(game);
  assert.equal(verdict.status, "passed");
});
