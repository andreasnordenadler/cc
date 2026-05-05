import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateRooklessRampage,
  normalizeLichessRooklessRampageGame,
  rooklessRampageFixtures,
} from "../src/lib/rookless-rampage.ts";

test("Rookless Rampage fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    rooklessRampageFixtures.map((fixture) => [fixture.id, evaluateRooklessRampage(fixture)]),
  );

  assert.equal(verdicts["fixture-two-rooks-gone-win"].status, "passed");
  assert.match(verdicts["fixture-two-rooks-gone-win"].summary, /Rookless Rampage confirmed/);
  assert.equal(verdicts["fixture-one-rook-survived"].status, "failed");
  assert.match(verdicts["fixture-one-rook-survived"].summary, /Only 1\/2 original rooks/);
  assert.equal(verdicts["fixture-unrated-two-rooks-gone-win"].status, "failed");
  assert.match(verdicts["fixture-unrated-two-rooks-gone-win"].summary, /rated games/);
  assert.equal(verdicts["fixture-rookless-loss"].status, "failed");
  assert.match(verdicts["fixture-rookless-loss"].summary, /still wins/);
});

test("Lichess latest-game normalizer tracks moved original rooks captured before move 20", () => {
  const rooklessGame = normalizeLichessRooklessRampageGame(
    {
      id: "lichess-rookless-rampage",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "TowerlessHero" } },
        black: { user: { name: "DemolitionCrew" } },
      },
      moves: "a2a4 d7d5 a1a3 d8d6 h2h4 d6a3 h1h3 a3h3 b1c3 e7e5 g1f3 b8c6 e2e4 g8f6 f1c4 f8e7 d2d3 e8g8 c1g5 h7h6 g5f6 e7f6 c3d5 h3h6 d1d2 h6h2 d2h6 g7h6 d5f6 h2g2 f6d7 g2f2 e1f2 f8d8 f2g1 d8d7 g1h2 d7d2 h2g1 d2d1", 
    },
    "towerlesshero",
  );

  assert.ok(rooklessGame);
  assert.equal(rooklessGame.playerColor, "white");
  assert.deepEqual(
    rooklessGame.rookLosses
      .filter((loss) => loss.color === "white")
      .map((loss) => [loss.origin, loss.square, loss.ply]),
    [["a1", "a3", 6], ["h1", "h3", 8]],
  );
  assert.equal(evaluateRooklessRampage(rooklessGame).status, "passed");
});
