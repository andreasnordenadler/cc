import assert from "node:assert/strict";
import { test } from "node:test";
import {
  earlyKingWalkFixtures,
  evaluateEarlyKingWalk,
  normalizeLichessEarlyKingWalkGame,
} from "../src/lib/early-king-walk.ts";

test("Early King Walk fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    earlyKingWalkFixtures.map((fixture) => [fixture.id, evaluateEarlyKingWalk(fixture)]),
  );

  assert.equal(verdicts["fixture-early-king-walk-win"].status, "passed");
  assert.match(verdicts["fixture-early-king-walk-win"].summary, /Early king walk confirmed/);
  assert.equal(verdicts["fixture-castling-is-not-walk"].status, "failed");
  assert.match(verdicts["fixture-castling-is-not-walk"].evidence.join(" "), /castling does not count/i);
  assert.equal(verdicts["fixture-king-walk-loss"].status, "failed");
  assert.match(verdicts["fixture-king-walk-loss"].summary, /player wins/);
});

test("Lichess latest-game normalizer detects non-castling king walk before move 12", () => {
  const earlyWalkGame = normalizeLichessEarlyKingWalkGame(
    {
      id: "lichess-early-king-walk-win",
      rated: true,
      perf: "rapid",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "PocketMonarch" } },
        black: { user: { name: "SensibleOpponent" } },
      },
      moves: "e2e4 e7e5 e1e2 b8c6 g1f3 g8f6 e2e1 f8c5 d2d3 e8g8 c1g5 d7d6 b1c3 c8g4",
    },
    "pocketmonarch",
  );

  assert.ok(earlyWalkGame);
  assert.equal(earlyWalkGame.playerColor, "white");
  assert.equal(earlyWalkGame.earlyKingWalkMove, 2);
  assert.equal(earlyWalkGame.castledBeforeKingWalk, false);
  assert.equal(evaluateEarlyKingWalk(earlyWalkGame).status, "passed");

  const castleOnlyGame = normalizeLichessEarlyKingWalkGame(
    {
      id: "lichess-castle-only-win",
      rated: false,
      perf: "blitz",
      variant: "standard",
      winner: "black",
      players: {
        white: { user: { name: "SensibleOpponent" } },
        black: { user: { name: "PocketMonarch" } },
      },
      moves: "e2e4 e7e5 g1f3 g8f6 f1c4 f8c5 e1g1 e8g8 d2d3 d7d6 b1c3 b8c6",
    },
    "pocketmonarch",
  );

  assert.ok(castleOnlyGame);
  assert.equal(castleOnlyGame.playerColor, "black");
  assert.equal(castleOnlyGame.earlyKingWalkMove, undefined);
  assert.equal(castleOnlyGame.castledBeforeKingWalk, true);
  assert.equal(evaluateEarlyKingWalk(castleOnlyGame).status, "failed");
});
