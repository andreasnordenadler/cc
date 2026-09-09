import assert from "node:assert/strict";
import test from "node:test";

import { refreshChessRatingSnapshots } from "../src/lib/chess-ratings";

const oversizedProviderHeaders = {
  "content-length": "2000001",
  "content-type": "application/json",
};

const now = new Date("2026-09-09T20:15:00.000Z");

test("Lichess rating refresh rejects an oversized provider body", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json(
    {
      username: "Alice",
      perfs: { blitz: { rating: 1800, games: 42 } },
    },
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const result = await refreshChessRatingSnapshots(
    { lichessUsername: "Alice" },
    { force: true, now },
  );

  assert.equal(result.snapshots.lichess?.error, "Lichess ratings could not refresh right now.");
  assert.deepEqual(result.snapshots.lichess?.ratings, []);
});

test("Chess.com rating refresh rejects an oversized provider body", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json(
    {
      chess_blitz: { last: { rating: 1750 } },
    },
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const result = await refreshChessRatingSnapshots(
    { chessComUsername: "Alice" },
    { force: true, now },
  );

  assert.equal(result.snapshots.chessCom?.error, "Chess.com ratings could not refresh right now.");
  assert.deepEqual(result.snapshots.chessCom?.ratings, []);
});
