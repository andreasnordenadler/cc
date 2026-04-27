import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateNoCastleClub,
  noCastleClubFixtures,
  normalizeLichessNoCastleClubGame,
} from "../src/lib/no-castle-club.ts";

test("No Castle Club fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    noCastleClubFixtures.map((fixture) => [fixture.id, evaluateNoCastleClub(fixture)]),
  );

  assert.equal(verdicts["fixture-no-castle-win"].status, "passed");
  assert.match(verdicts["fixture-no-castle-win"].summary, /zero player castling/);
  assert.equal(verdicts["fixture-player-castled"].status, "failed");
  assert.match(verdicts["fixture-player-castled"].summary, /castle/);
  assert.equal(verdicts["fixture-uncastled-loss"].status, "failed");
  assert.match(verdicts["fixture-uncastled-loss"].summary, /still wins/);
});

test("Lichess latest-game normalizer detects UCI castling for only the player", () => {
  const noCastleGame = normalizeLichessNoCastleClubGame(
    {
      id: "lichess-no-castle-win",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "KingWalker" } },
        black: { user: { name: "SensibleOpponent" } },
      },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 b1d2 e8g8 d1e2 c8g4 h2h3 g4h5 g2g4 h5g6 d2f1 d8d7 c1g5 f6g4 h3g4 d7g4",
    },
    "kingwalker",
  );

  assert.ok(noCastleGame);
  assert.equal(noCastleGame.playerColor, "white");
  assert.deepEqual(noCastleGame.castling, [{ ply: 12, color: "black", side: "kingside" }]);
  assert.equal(evaluateNoCastleClub(noCastleGame).status, "passed");

  const castledGame = normalizeLichessNoCastleClubGame(
    {
      id: "lichess-player-castled-win",
      rated: true,
      perf: "rapid",
      variant: "standard",
      winner: "white",
      players: {
        white: { user: { name: "KingWalker" } },
        black: { user: { name: "SensibleOpponent" } },
      },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1g1 f8c5 d2d3 e8g8 c2c3 d7d6 b1d2 c8g4 h2h3 g4h5",
    },
    "kingwalker",
  );

  assert.ok(castledGame);
  assert.equal(evaluateNoCastleClub(castledGame).status, "failed");
});
