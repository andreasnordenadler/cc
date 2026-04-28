import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bishopFieldTripFixtures,
  evaluateBishopFieldTrip,
  normalizeLichessBishopFieldTripGame,
} from "../src/lib/bishop-field-trip.ts";

test("Bishop Field Trip fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    bishopFieldTripFixtures.map((fixture) => [fixture.id, evaluateBishopFieldTrip(fixture)]),
  );

  assert.equal(verdicts["fixture-bishops-before-queen-win"].status, "passed");
  assert.match(verdicts["fixture-bishops-before-queen-win"].summary, /Bishop field trip confirmed/);
  assert.equal(verdicts["fixture-queen-too-soon"].status, "failed");
  assert.match(verdicts["fixture-queen-too-soon"].summary, /queen got attention/);
  assert.equal(verdicts["fixture-bishop-trip-loss"].status, "failed");
  assert.match(verdicts["fixture-bishop-trip-loss"].summary, /player wins/);
});

test("Lichess latest-game normalizer detects both original bishops before the queen", () => {
  const bishopsFirstGame = normalizeLichessBishopFieldTripGame(
    {
      id: "lichess-bishops-first-win",
      rated: true,
      perf: "rapid",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "DiagonalDaycare" } },
        black: { user: { name: "SensibleOpponent" } },
      },
      moves: "e2e4 e7e5 f1c4 b8c6 g1f3 g8f6 d2d3 f8c5 c1g5 d7d6 b1c3 c8g4 d1d2 e8g8 e1c1",
    },
    "diagonaldaycare",
  );

  assert.ok(bishopsFirstGame);
  assert.equal(bishopsFirstGame.playerColor, "white");
  assert.deepEqual(bishopsFirstGame.movedBishopHomeSquaresBeforeQueen, ["c1", "f1"]);
  assert.equal(bishopsFirstGame.bothBishopsMovedBeforeQueen, true);
  assert.equal(evaluateBishopFieldTrip(bishopsFirstGame).status, "passed");

  const queenTooSoonGame = normalizeLichessBishopFieldTripGame(
    {
      id: "lichess-queen-too-soon",
      rated: false,
      perf: "blitz",
      variant: "standard",
      winner: "black",
      players: {
        white: { user: { name: "SensibleOpponent" } },
        black: { user: { name: "DiagonalDaycare" } },
      },
      moves: "e2e4 e7e5 g1f3 g8f6 f1c4 d8e7 d2d3 f8c5 e1g1 e8g8 b1c3 b8c6",
    },
    "diagonaldaycare",
  );

  assert.ok(queenTooSoonGame);
  assert.equal(queenTooSoonGame.playerColor, "black");
  assert.deepEqual(queenTooSoonGame.movedBishopHomeSquaresBeforeQueen, []);
  assert.equal(queenTooSoonGame.queenMovedOnPlayerMove, 3);
  assert.equal(evaluateBishopFieldTrip(queenTooSoonGame).status, "failed");
});
