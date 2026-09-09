import assert from "node:assert/strict";
import test from "node:test";

import { checkLatestLichessBackRankGoblin } from "../src/lib/back-rank-goblin";
import { checkLatestLichessBishopFieldTrip } from "../src/lib/bishop-field-trip";
import { checkLatestLichessEarlyKingWalk } from "../src/lib/early-king-walk";
import { checkLatestLichessKnightmareMode } from "../src/lib/knightmare-mode";
import { checkLatestLichessKnightsBeforeCoffee } from "../src/lib/knights-before-coffee";
import { checkLatestLichessFinishedGame, verifyFinishAnyGameAttempt } from "../src/lib/lichess";
import { checkLatestLichessNoCastleClub } from "../src/lib/no-castle-club";
import { checkLatestLichessOneBishopToRuleThemAll } from "../src/lib/one-bishop-to-rule-them-all";
import { checkLatestLichessPawnOnlyPicnic } from "../src/lib/pawn-only-picnic";
import { checkLatestLichessPawnStormManiac } from "../src/lib/pawn-storm-maniac";
import { checkLatestLichessQueenNeverHeardOfHer } from "../src/lib/queen-never-heard-of-her";
import { checkLatestLichessRooklessRampage } from "../src/lib/rookless-rampage";
import { checkLatestLichessBlunderGambit } from "../src/lib/the-blunder-gambit";

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

test("Blunder Gambit rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessBlunderGambit("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
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

test("Pawn Storm Maniac rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessPawnStormManiac("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("Bishop Field Trip rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessBishopFieldTrip("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("Knights Before Coffee rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessKnightsBeforeCoffee("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("Early King Walk rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessEarlyKingWalk("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("Pawn-Only Picnic rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessPawnOnlyPicnic("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("One Bishop to Rule Them All rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessOneBishopToRuleThemAll("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("Knightmare Mode rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessKnightmareMode("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("No Castle Club rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessNoCastleClub("Alice");

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.gameId, "lichess-latest-error");
  assert.match(verdict.summary, /could not complete/i);
});

test("Queen? Never Heard of Her rejects an oversized latest Lichess body before evaluating the game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    `${JSON.stringify({ ...finishedLichessGame(), rated: true, speed: "blitz" })}\n`,
    { status: 200, headers: oversizedProviderHeaders },
  ));

  const verdict = await checkLatestLichessQueenNeverHeardOfHer("Alice");

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
