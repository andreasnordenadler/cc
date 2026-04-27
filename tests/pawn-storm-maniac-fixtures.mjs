import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluatePawnStormManiac,
  normalizeLichessPawnStormManiacGame,
  pawnStormManiacFixtures,
} from "../src/lib/pawn-storm-maniac.ts";

test("Pawn Storm Maniac fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    pawnStormManiacFixtures.map((fixture) => [fixture.id, evaluatePawnStormManiac(fixture)]),
  );

  assert.equal(verdicts["fixture-six-pawn-storm-win"].status, "passed");
  assert.match(verdicts["fixture-six-pawn-storm-win"].summary, /Six-pawn storm/);
  assert.equal(verdicts["fixture-five-pawn-drizzle"].status, "failed");
  assert.match(verdicts["fixture-five-pawn-drizzle"].summary, /Only 5/);
  assert.equal(verdicts["fixture-pawn-storm-loss"].status, "failed");
  assert.match(verdicts["fixture-pawn-storm-loss"].summary, /still wins/);
});

test("Lichess latest-game normalizer counts distinct early player pawn moves", () => {
  const pawnStormGame = normalizeLichessPawnStormManiacGame(
    {
      id: "lichess-six-pawn-storm-win",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "PawnWeather" } },
        black: { user: { name: "PieceDeveloper" } },
      },
      moves: "a2a4 e7e5 b2b4 g8f6 c2c4 f8b4 d2d4 e5d4 e2e4 b8c6 f2f4 e8g8 g1f3 d7d6 f1d3 c8g4 e1g1 d8d7 b1d2 a8e8 h2h3 g4h5 g2g4 h5g6 f4f5 c6e5 f3e5 d6e5 d1g4 h7h6 a1b1 b7b6 c1a3 c7c5 g4g3 d7e6 b1b3 a7a6 g1h1", 
    },
    "pawnweather",
  );

  assert.ok(pawnStormGame);
  assert.equal(pawnStormGame.playerColor, "white");
  assert.deepEqual(
    pawnStormGame.pawnMoves
      .filter((event) => event.color === "white")
      .slice(0, 6)
      .map((event) => event.from),
    ["a2", "b2", "c2", "d2", "e2", "f2"],
  );
  assert.equal(evaluatePawnStormManiac(pawnStormGame).status, "passed");

  const quietGame = normalizeLichessPawnStormManiacGame(
    {
      id: "lichess-quiet-win",
      rated: true,
      perf: "rapid",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "PawnWeather" } },
        black: { user: { name: "PieceDeveloper" } },
      },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 e1g1 e8g8 b1d2 c8g4 h2h3 g4h5 d1e2 d8d7 f1e1 a8e8 a2a3 a7a6 h3h4 h7h6 b2b3 b7b6 c1b2 c6a5 c4a6 h5f3 e2f3 a5c6 a1d1 a6a5 d1d2", 
    },
    "pawnweather",
  );

  assert.ok(quietGame);
  assert.equal(evaluatePawnStormManiac(quietGame).status, "failed");
});
