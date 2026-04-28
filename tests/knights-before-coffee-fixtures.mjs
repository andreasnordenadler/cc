import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateKnightsBeforeCoffee,
  knightsBeforeCoffeeFixtures,
  normalizeLichessKnightsBeforeCoffeeGame,
} from "../src/lib/knights-before-coffee.ts";

test("Knights Before Coffee fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    knightsBeforeCoffeeFixtures.map((fixture) => [fixture.id, evaluateKnightsBeforeCoffee(fixture)]),
  );

  assert.equal(verdicts["fixture-horse-first-win"].status, "passed");
  assert.match(verdicts["fixture-horse-first-win"].summary, /Horse-first opening confirmed/);
  assert.equal(verdicts["fixture-pawn-before-coffee"].status, "failed");
  assert.match(verdicts["fixture-pawn-before-coffee"].summary, /not a knight move/);
  assert.equal(verdicts["fixture-horse-first-loss"].status, "failed");
  assert.match(verdicts["fixture-horse-first-loss"].summary, /player wins/);
});

test("Lichess latest-game normalizer detects the first four player pieces from UCI moves", () => {
  const horseFirstGame = normalizeLichessKnightsBeforeCoffeeGame(
    {
      id: "lichess-horse-first-win",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "CoffeeHorse" } },
        black: { user: { name: "SensibleOpponent" } },
      },
      moves: "g1f3 e7e5 b1c3 b8c6 f3g5 d7d6 c3b5 g8f6 e2e4 f8e7 d2d3 e8g8 c1e3 c8g4 f2f3 g4h5 d1d2",
    },
    "coffeehorse",
  );

  assert.ok(horseFirstGame);
  assert.equal(horseFirstGame.playerColor, "white");
  assert.deepEqual(horseFirstGame.firstFourPlayerMovePieces, ["knight", "knight", "knight", "knight"]);
  assert.equal(evaluateKnightsBeforeCoffee(horseFirstGame).status, "passed");

  const pawnTooSoonGame = normalizeLichessKnightsBeforeCoffeeGame(
    {
      id: "lichess-pawn-too-soon",
      rated: true,
      perf: "rapid",
      variant: "standard",
      winner: "black",
      players: {
        white: { user: { name: "SensibleOpponent" } },
        black: { user: { name: "CoffeeHorse" } },
      },
      moves: "e2e4 g8f6 d2d4 e7e5 g1f3 b8c6 f1c4 f8c5 e1g1 e8g8 c2c3 d7d6",
    },
    "coffeehorse",
  );

  assert.ok(pawnTooSoonGame);
  assert.equal(pawnTooSoonGame.playerColor, "black");
  assert.deepEqual(pawnTooSoonGame.firstFourPlayerMovePieces, ["knight", "pawn", "knight", "bishop"]);
  assert.equal(evaluateKnightsBeforeCoffee(pawnTooSoonGame).status, "failed");
});
