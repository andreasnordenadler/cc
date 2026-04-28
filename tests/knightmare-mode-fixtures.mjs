import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateKnightmareMode,
  knightmareModeFixtures,
  normalizeLichessKnightmareModeGame,
} from "../src/lib/knightmare-mode.ts";

test("Knightmare Mode fixtures cover pass and key failures", () => {
  const verdicts = Object.fromEntries(
    knightmareModeFixtures.map((fixture) => [fixture.id, evaluateKnightmareMode(fixture)]),
  );

  assert.equal(verdicts["fixture-knight-mate-win"].status, "passed");
  assert.match(verdicts["fixture-knight-mate-win"].summary, /Knight checkmate/);
  assert.equal(verdicts["fixture-bishop-mate-win"].status, "failed");
  assert.match(verdicts["fixture-bishop-mate-win"].summary, /not a knight/);
  assert.equal(verdicts["fixture-knight-last-move-resign"].status, "failed");
  assert.match(verdicts["fixture-knight-last-move-resign"].summary, /did not end by checkmate/);
});

test("Lichess latest-game normalizer identifies a knight as the final mating move", () => {
  const knightmareGame = normalizeLichessKnightmareModeGame(
    {
      id: "lichess-knight-mate",
      rated: true,
      perf: "blitz",
      variant: "standard",
      winner: "white",
      status: "mate",
      players: {
        white: { user: { name: "HorseCrime" } },
        black: { user: { name: "MatedByHorse" } },
      },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 e8g8 e1g1 d7d6 h2h3 c8e6 b1d2 d8d7 f1e1 a7a6 c4b3 b7b5 d2f1 a8e8 f1g3 h7h6 c1e3 c5e3 e1e3 c6e7 d1d2 f6g6 a1e1 c7c5 g3h5 g6f4 h5f4 e5f4 e3e2 e6b3 a2b3 f7f5 e4f5 e7f5 f3h4 f5h4 e2e8 d7e8 e1e8",
    },
    "horsecrime",
  );

  assert.ok(knightmareGame);
  assert.equal(knightmareGame.playerColor, "white");
  assert.equal(knightmareGame.finalMove?.piece, "rook");
  assert.equal(evaluateKnightmareMode(knightmareGame).status, "failed");

  const directKnightMate = normalizeLichessKnightmareModeGame(
    {
      id: "lichess-direct-knight-mate",
      rated: true,
      speed: "bullet",
      variant: "standard",
      winner: "white",
      status: "mate",
      players: {
        white: { user: { name: "HorseCrime" } },
        black: { user: { name: "MatedByHorse" } },
      },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 e8g8 e1g1 d7d6 h2h3 c8e6 b1d2 d8d7 d2f1 a7a6 f1g3 b7b5 g3h5",
    },
    "horsecrime",
  );

  assert.ok(directKnightMate);
  assert.equal(directKnightMate.finalMove?.piece, "knight");
  assert.equal(directKnightMate.finalMove?.from, "g3");
  assert.equal(directKnightMate.finalMove?.to, "h5");
  assert.equal(evaluateKnightmareMode(directKnightMate).status, "passed");
});
