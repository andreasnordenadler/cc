import assert from "node:assert/strict";
import test from "node:test";
import { checkLatestLichessFinishedGame } from "../src/lib/lichess";
import * as metadata from "../src/lib/user-metadata";
import { POST, withMobileQuestRouteTestDependencies } from "../src/app/api/mobile/quest/route";

// Synthetic transport/account only; exercise production route, eligibility and persistence.
test("older-than-quest provider game is persisted as an observation, not a failed quest", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ ...finished, lastMoveAt: Date.parse("2026-10-12T10:05:00Z") })));
  let current: Record<string, unknown> = { lichessUsername: "Alice", activeChallenge: { id: "finish-any-game", status: "accepted", startedAt: "2026-10-12T11:00:00Z" }, challengeProgress: { completedChallengeIds: [] } };
  const response = await withMobileQuestRouteTestDependencies({ authenticate: async () => "fixture-user", getClient: async () => ({ users: {
    getUser: async () => ({ publicMetadata: current, privateMetadata: {} }),
    updateUserMetadata: async (_id: string, update: { publicMetadata: Record<string, unknown> }) => { current = update.publicMetadata; },
  } }) as never }, () => POST(new Request("https://sidequestchess.com/api/mobile/quest", { method: "POST", body: JSON.stringify({ action: "check" }) })));
  assert.equal(response.status, 200);
  const attempts = current.challengeAttempts as metadata.ChallengeAttempt[];
  assert.equal(attempts.at(-1)?.status, "pending");
  assert.deepEqual(attempts.at(-1)?.observedGame, { gameId: "Abcd1234", startedGameAt: "2026-10-12T10:00:00.000Z", completedGameAt: "2026-10-12T10:05:00.000Z" });
  assert.equal((current.challengeProgress as { completedChallengeIds: string[] }).completedChallengeIds.length, 0);
});

const oldVerdict = { gameId: "Abcd1234", status: "passed", startedGameAt: "2026-10-12T10:00:00.000Z", completedGameAt: "2026-10-12T10:05:00.000Z" };

test("captures real provider game independently of later synthetic pending quest receipt", () => {
  assert.equal(typeof metadata.captureLatestGameObservation, "function", "observation capture is not implemented");
  assert.deepEqual(metadata.captureLatestGameObservation(oldVerdict), {
    gameId: "Abcd1234", startedGameAt: "2026-10-12T10:00:00.000Z", completedGameAt: "2026-10-12T10:05:00.000Z",
  });
});

test("observation strips invalid dates and rejects synthetic pending IDs", () => {
  assert.deepEqual(metadata.captureLatestGameObservation({ ...oldVerdict, startedGameAt: "invalid", completedGameAt: "invalid" }), {
    gameId: "Abcd1234", startedGameAt: undefined, completedGameAt: undefined,
  });
  for (const gameId of ["lichess-latest-error", "lichess-no-recent-games", "any-game-counts-new-game-required", "finish-any-game-before_cutoff"]) {
    assert.equal(metadata.captureLatestGameObservation({ ...oldVerdict, gameId, status: "pending" }), undefined);
  }
});

test("last provider check and latest observed game stay separate through delayed indexing", () => {
  assert.equal(typeof metadata.buildLatestGameVisibility, "function", "visibility projection is not implemented");
  const attempts = [
    { ...oldVerdict, provider: "lichess" as const, status: "pending", gameId: "any-game-counts-new-game-required", observedGame: metadata.captureLatestGameObservation(oldVerdict), checkedAt: "2026-10-12T11:00:00.000Z" },
    { provider: "lichess" as const, status: "pending", gameId: "lichess-latest-error", checkedAt: "2026-10-12T11:05:00.000Z" },
  ];
  const result = metadata.buildLatestGameVisibility(attempts);
  assert.equal(result?.game?.gameId, "Abcd1234");
  assert.equal(result?.game?.completedGameAt, "2026-10-12T10:05:00.000Z");
  assert.equal(result?.checkedAt, "2026-10-12T11:05:00.000Z");
  assert.equal(result?.pending, true);
});

test("current synthetic cutoff receipts never label pending status as a real played game", () => {
  for (const suffix of ["new-game-required", "before_cutoff", "game_start_unconfirmed", "quest_start_unconfirmed"]) {
    const attempt = { ...oldVerdict, gameId: `any-game-counts-${suffix}`, status: "pending", checkedAt: "2026-10-12T11:00:00.000Z" };
    assert.equal(metadata.isSyntheticLatestGameReceipt(attempt), true);
    assert.doesNotMatch(metadata.buildAttemptSummary(attempt).meta, /Game played|any-game-counts-/);
  }
});

const finished = {
  id: "Abcd1234", status: "mate", winner: "white", moves: "e2e4 e7e5",
  createdAt: Date.parse("2026-10-12T10:00:00Z"),
  players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } },
};

test("latest Lichess observation never invents completion time from game start", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(finished)));
  const verdict = await checkLatestLichessFinishedGame("Alice");
  assert.equal(verdict.status, "passed");
  assert.equal(verdict.gameId, "Abcd1234");
  assert.equal(verdict.startedGameAt, "2026-10-12T10:00:00.000Z");
  assert.equal(verdict.completedGameAt, undefined);
});

test("invalid provider dates do not discard a real found game or become check time", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ ...finished, createdAt: 1e30, lastMoveAt: 1e30 })));
  const verdict = await checkLatestLichessFinishedGame("Alice");
  assert.equal(verdict.gameId, "Abcd1234");
  assert.equal(verdict.status, "passed");
  assert.equal(verdict.startedGameAt, undefined);
  assert.equal(verdict.completedGameAt, undefined);
});
