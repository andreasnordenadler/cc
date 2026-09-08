import assert from "node:assert/strict";
import test from "node:test";

import { checkLatestGroupQuestChallenge } from "../src/lib/groupquest-proof";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

test("Lichess matching selected rules preserves successful proof semantics", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(`${JSON.stringify({
    id: "li-match",
    status: "mate",
    winner: "white",
    speed: "blitz",
    rated: true,
    variant: "standard",
    clock: { initial: 180, increment: 2 },
    createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
    players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
    moves: "e2e4 e7e5",
  })}\n`, { status: 200 }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "finish-any-game",
    provider: "lichess",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { result: "Win required", timeControl: "Blitz", rated: "Rated only", color: "White only" },
  });
  assert.equal(result.status, "passed");
  assert.deepEqual(result.mismatchReasons, []);
  assert.equal(result.gameUrl, "https://lichess.org/li-match");
});

test("Chess.com mismatching selected rules returns machine-readable reasons", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => String(url).endsWith("/archives")
    ? jsonResponse({ archives: ["https://api.chess.com/archive"] })
    : jsonResponse({ games: [{
      url: "https://www.chess.com/game/live/99",
      end_time: Date.parse("2026-07-02T10:00:00.000Z") / 1000,
      rules: "chess",
      time_class: "rapid",
      time_control: "600+5",
      rated: false,
      white: { username: "RuleCarol", result: "agreed" },
      black: { username: "Dan", result: "agreed" },
      pgn: "[UTCDate \"2026.07.02\"]\n[UTCTime \"09:50:00\"]\n\n1. e4 e5 1/2-1/2",
    }] }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "finish-any-game",
    provider: "chesscom",
    username: "RuleCarol",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { result: "Win required", timeControl: "Blitz", rated: "Rated only", color: "Black only" },
  });
  assert.equal(result.status, "failed");
  assert.deepEqual(result.mismatchReasons, ["time_control_mismatch", "rated_state_mismatch", "player_color_mismatch", "result_mismatch"]);
  assert.match(result.summary, /Proof was not awarded/);
});

test("failed quest attempts still report mismatched Multiplayer table rules", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(`${JSON.stringify({
    id: "li-quest-fail-table-mismatch",
    status: "mate",
    winner: "white",
    speed: "rapid",
    rated: false,
    variant: "standard",
    clock: { initial: 600, increment: 5 },
    createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
    lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
    players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
    moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 b2b4 c5b6 a2a4 a7a6",
  })}\n`, { status: 200 }));

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "queen-never-heard-of-her",
    provider: "lichess",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { timeControl: "Blitz", rated: "Rated only", color: "Black only" },
  });

  assert.equal(result.status, "failed");
  assert.deepEqual(result.mismatchReasons, ["time_control_mismatch", "rated_state_mismatch", "player_color_mismatch"]);
  assert.match(result.summary, /Proof was not awarded/);
  assert.equal(result.failureDiagnostic?.label, "Latest checked position");
});

test("first-break quest diagnostics do not bypass Multiplayer table rule checks", async (t) => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests += 1;
    return new Response(`${JSON.stringify({
      id: "li-first-break-table-mismatch",
      status: "mate",
      winner: "white",
      speed: "rapid",
      rated: false,
      variant: "standard",
      clock: { initial: 600, increment: 5 },
      createdAt: Date.parse("2026-07-02T09:55:00.000Z"),
      lastMoveAt: Date.parse("2026-07-02T10:00:00.000Z"),
      players: { white: { user: { name: "RuleAlice" } }, black: { user: { name: "Bob" } } },
      moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1g1 f8c5 d2d3 e8g8 c2c3 d7d6 b1d2 c8g4 h2h3 g4h5 b2b4 c5b6 a2a4",
    })}\n`, { status: 200 });
  });

  const result = await checkLatestGroupQuestChallenge({
    challengeId: "no-castle-club",
    provider: "lichess",
    username: "RuleAlice",
    startAt: "2026-07-02T09:00:00.000Z",
    endAt: "2026-07-02T11:00:00.000Z",
    rules: { timeControl: "Blitz", rated: "Rated only", color: "Black only" },
  });

  assert.equal(requests, 2, "the first-break verdict must still load provider rule metadata");
  assert.equal(result.status, "failed");
  assert.deepEqual(result.mismatchReasons, ["time_control_mismatch", "rated_state_mismatch", "player_color_mismatch"]);
  assert.equal(result.failureDiagnostic?.label, "Castling broke the condition");
  assert.equal(result.failureDiagnostic?.ply, 7);
});
