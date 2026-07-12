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
