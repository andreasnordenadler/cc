import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateQueenNeverHeardOfHer,
  normalizeLichessQueenChallengeGame,
  queenNeverHeardOfHerFixtures,
} from "../src/lib/queen-never-heard-of-her.ts";

test("Queen? Never Heard of Her normalized fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    queenNeverHeardOfHerFixtures.map((fixture) => [fixture.id, evaluateQueenNeverHeardOfHer(fixture)]),
  );

  assert.equal(verdicts["fixture-queenless-win"].status, "passed");
  assert.match(verdicts["fixture-queenless-win"].summary, /Queen lost before move 15/);
  assert.equal(verdicts["fixture-queen-stayed-home"].status, "failed");
  assert.match(verdicts["fixture-queen-stayed-home"].summary, /No player queen loss/);
  assert.equal(verdicts["fixture-traded-queens-first"].status, "failed");
  assert.match(verdicts["fixture-traded-queens-first"].summary, /opponent did not still have theirs/);
});

test("Lichess latest-game normalizer turns UCI moves into queen challenge capture evidence", () => {
  const game = normalizeLichessQueenChallengeGame(
    {
      id: "lichess-queen-drop-win",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "ChaosPilot" } },
        black: { user: { name: "SensibleOpponent" } },
      },
      moves: "e2e4 e7e5 d1h5 b8c6 h5f7 e8e7 g1f3 g8f6 f7g7 e7e8 g7h8 f8b4 c2c3 b4c5 h8g7 h7h6 g7f6 d8f6 f1c4 d7d6 e1g1 c8g4 d2d4 e5d4 c3d4 c6d4 f3d4 g4d1 f1d1",
    },
    "chaospilot",
  );

  assert.ok(game);
  assert.equal(game.playerColor, "white");
  assert.equal(game.timeClass, "blitz");
  assert.equal(game.captures.some((capture) => capture.capturedPiece === "queen" && capture.capturedColor === "white"), true);

  const verdict = evaluateQueenNeverHeardOfHer(game);
  assert.equal(verdict.status, "passed");
});
