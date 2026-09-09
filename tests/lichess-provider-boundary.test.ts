import assert from "node:assert/strict";
import test from "node:test";

import { checkLatestLichessBackRankGoblin } from "../src/lib/back-rank-goblin";
import { checkLatestLichessFinishedGame, verifyFinishAnyGameAttempt } from "../src/lib/lichess";
import { checkLatestLichessRooklessRampage } from "../src/lib/rookless-rampage";

const oversizedProviderHeaders = {
  "content-length": "2000001",
  "content-type": "application/x-ndjson",
};

function finishedLichessGame() {
  return {
    id: "Abcd1234",
    status: "resign",
    winner: "white" as const,
    moves: "e2e4 e7e5",
    variant: "standard",
    createdAt: Date.UTC(2026, 8, 9, 12, 0, 0),
    lastMoveAt: Date.UTC(2026, 8, 9, 12, 1, 0),
    players: {
      white: { user: { name: "Alice" } },
      black: { user: { name: "Bob" } },
    },
  };
}

test("Back Rank Goblin rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify(finishedLichessGame())}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessBackRankGoblin("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not inspect latest Lichess games/i);
});

test("Rookless Rampage rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessRooklessRampage("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("latest Lichess proof rejects an oversized provider body before accepting the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify(finishedLichessGame())}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessFinishedGame("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("submitted Lichess proof rejects an oversized provider body before accepting the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json(
    finishedLichessGame(),
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await verifyFinishAnyGameAttempt({
    gameId: "Abcd1234",
    lichessUsername: "Alice",
  });

  assert.equal(verdict.status, "pending");
  assert.match(verdict.summary, /could not complete right now/i);
});
