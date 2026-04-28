import assert from "node:assert/strict";
import { test } from "node:test";
import {
  blunderGambitFixtures,
  evaluateBlunderGambit,
  normalizeLichessBlunderGambitGame,
} from "../src/lib/the-blunder-gambit.ts";

test("The Blunder Gambit fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    blunderGambitFixtures.map((fixture) => [fixture.id, evaluateBlunderGambit(fixture)]),
  );

  assert.equal(verdicts["fixture-hung-bishop-still-won"].status, "passed");
  assert.match(verdicts["fixture-hung-bishop-still-won"].summary, /Early material hang/);
  assert.equal(verdicts["fixture-immediate-equal-recapture"].status, "failed");
  assert.match(verdicts["fixture-immediate-equal-recapture"].summary, /No early unbalanced/);
  assert.equal(verdicts["fixture-late-blunder-win"].status, "failed");
  assert.match(verdicts["fixture-late-blunder-win"].evidence.join(" "), /No player knight, bishop, or rook/);
  assert.equal(verdicts["fixture-blunder-loss"].status, "failed");
  assert.match(verdicts["fixture-blunder-loss"].summary, /still wins/);
});

test("Lichess latest-game normalizer detects an early unbalanced piece hang", () => {
  const gambitGame = normalizeLichessBlunderGambitGame(
    {
      id: "lichess-blunder-gambit-win",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "TheoryAccident" } },
        black: { user: { name: "FreePieceEnjoyer" } },
      },
      moves: "e2e4 e7e5 f1c4 b8c6 d2d3 f8c5 c4f7 e8f7 g1f3 d7d6 e1g1 g8f6 b1c3 h7h6 c1e3 c5e3 f2e3 c8g4 d1e1 h8e8 e1g3 g4e6 f3h4 f7g8 h4f5 e6f5 e4f5 d8d7 c3e4",
    },
    "theoryaccident",
  );

  assert.ok(gambitGame);
  assert.equal(gambitGame.playerColor, "white");
  assert.ok(gambitGame.captures.some((capture) => capture.capturedColor === "white" && capture.capturedPiece === "knight"));
  assert.equal(evaluateBlunderGambit(gambitGame).status, "passed");

  const balancedGame = normalizeLichessBlunderGambitGame(
    {
      id: "lichess-balanced-trade-win",
      rated: true,
      perf: "rapid",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "TheoryAccident" } },
        black: { user: { name: "FreePieceEnjoyer" } },
      },
      moves: "e2e4 e7e5 g1f3 g8f6 f3e5 f6e4 d1e2 d7d5 d2d3 e4f6 e5c6 b7c6 b1c3 f8e7 c1g5 e8g8 e1c1 c8g4 f2f3 g4e6 d3d4",
    },
    "theoryaccident",
  );

  assert.ok(balancedGame);
  assert.equal(evaluateBlunderGambit(balancedGame).status, "failed");
});
