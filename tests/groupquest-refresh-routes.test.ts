import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import * as webRoute from "../src/app/api/groupquests/[id]/refresh/route";
import * as mobileRoute from "../src/app/api/mobile/groupquests/[id]/route";

function setNodeEnv(value: string | undefined) {
  Object.defineProperty(process.env, "NODE_ENV", { value, writable: true, configurable: true, enumerable: true });
}
setNodeEnv("test");

const baseQuest = {
  id: "gq",
  hostUserId: "host",
  hostName: "Host",
  name: "Test quest",
  inviteMode: "public" as const,
  providerMode: "both" as const,
  providerLabel: "Lichess or Chess.com",
  questIds: ["old", "new", "new"],
  customQuestSnapshots: [
    { id: "old", title: "Old", summary: "Old", config: "{}", reward: 100 },
    { id: "new", title: "New", summary: "New", config: "{}", reward: 50 },
  ],
  startAt: "2026-07-01T00:00:00.000Z",
  endAt: "2026-07-20T00:00:00.000Z",
  rules: {},
  participants: [
    { userId: "victim", provider: "lichess" as const, username: "Victim", leaderboardName: "Victim", joinedAt: "2026-07-01T00:00:00.000Z", completedQuestIds: [], questFinishedAt: {}, score: 0 },
    { userId: "current", provider: "chesscom" as const, username: "CurrentChess", leaderboardName: "Current", joinedAt: "2026-07-01T00:00:00.000Z", completedQuestIds: ["old"], questFinishedAt: { old: "2026-07-02T00:00:00.000Z" }, score: 100 },
  ],
};

const mismatch = {
  status: "failed" as const,
  gameId: "game-new",
  summary: "Latest game used the wrong clock",
  mismatchReasons: ["time_control_mismatch" as const],
  gameUrl: "https://example.test/game-new",
  finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
  lastMoveUci: "e7e8q",
  lastMoveSan: "e8=Q",
};

afterEach(() => {
  webRoute.setWebRefreshRouteTestDependencies(null);
  mobileRoute.setMobileRefreshRouteTestDependencies(null);
});

function request() {
  return new Request("https://sqc.test/api/groupquests/gq/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "refresh", participantUserId: "victim" }),
  });
}

function fakeClient(writes: Array<{ userId: string; metadata: Record<string, unknown> }>) {
  return {
    users: {
      getUser: async (userId: string) => ({
        id: userId,
        firstName: "Current",
        username: "current",
        publicMetadata: {
          challengeProgress: { completedChallengeIds: ["old"] },
          challengeAttempts: [],
        },
        privateMetadata: {},
      }),
      updateUserMetadata: async (userId: string, metadata: Record<string, unknown>) => { writes.push({ userId, metadata }); },
    },
  };
}

for (const variant of ["web", "mobile"] as const) {
  test(`${variant} exported POST ignores attacker participant selection and performs no writes for mismatches/already-completed proofs`, async () => {
    const checked: Array<{ questId: string; provider: string; username: string }> = [];
    const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];
    const client = fakeClient(writes);
    const dependencies = {
      authenticate: async () => "current",
      getClient: async () => client,
      findQuest: async () => ({ userId: "host", groupQuest: structuredClone(baseQuest) }),
      check: async ({ challengeId, provider, username }: { challengeId: string; provider: string; username: string }) => {
        checked.push({ questId: challengeId, provider, username });
        return challengeId === "old"
          ? { status: "passed" as const, gameId: "old-game", summary: "Already complete", gameTime: "2026-07-02T00:00:00.000Z" }
          : mismatch;
      },
    };
    if (variant === "web") webRoute.setWebRefreshRouteTestDependencies(dependencies as never);
    else mobileRoute.setMobileRefreshRouteTestDependencies(dependencies as never);

    const response = variant === "web"
      ? await webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })
      : await mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(checked, [
      { questId: "old", provider: "chesscom", username: "CurrentChess" },
      { questId: "new", provider: "chesscom", username: "CurrentChess" },
    ]);
    assert.equal(writes.length, 0, "neither group metadata nor completion attempts may be written");
    assert.deepEqual(body.completedQuestIds, ["old"]);
    assert.equal(body.score, 100);
    assert.deepEqual(body.checks[1], {
      questId: "new", status: "failed", summary: mismatch.summary, gameId: mismatch.gameId,
      gameUrl: mismatch.gameUrl, mismatchCode: "time_control_mismatch", mismatchReasons: ["time_control_mismatch"],
      finalPositionFen: mismatch.finalPositionFen, lastMoveUci: mismatch.lastMoveUci, lastMoveSan: mismatch.lastMoveSan,
    });
    if (variant === "web") assert.equal(body.ok, true);
    else assert.deepEqual(
      { apiVersion: body.apiVersion, authenticated: body.authenticated, ok: body.ok, action: body.action, groupQuestId: body.groupQuestId },
      { apiVersion: 1, authenticated: true, ok: true, action: "refresh", groupQuestId: "gq" },
    );
  });

  test(`${variant} exported POST persists and creates attempts only for the unique newly passed quest`, async () => {
    const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];
    const client = fakeClient(writes);
    const dependencies = {
      authenticate: async () => "current",
      getClient: async () => client,
      findQuest: async () => ({ userId: "host", groupQuest: structuredClone(baseQuest) }),
      check: async ({ challengeId }: { challengeId: string }) => ({
        status: "passed" as const,
        gameId: `${challengeId}-game`,
        summary: `${challengeId} passed`,
        gameTime: challengeId === "old" ? "2026-07-02T00:00:00.000Z" : "2026-07-03T00:00:00.000Z",
      }),
    };
    if (variant === "web") webRoute.setWebRefreshRouteTestDependencies(dependencies as never);
    else mobileRoute.setMobileRefreshRouteTestDependencies(dependencies as never);

    const response = variant === "web"
      ? await webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })
      : await mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body.completedQuestIds, ["old", "new"]);
    assert.equal(body.score, 150);
    const publicWrites = writes.filter((entry) => "publicMetadata" in entry.metadata);
    assert.equal(publicWrites.length, 1, "one completion metadata write is expected");
    const publicMetadata = publicWrites[0].metadata.publicMetadata as { challengeProgress: { completedChallengeIds: string[] }; challengeAttempts: Array<{ challengeId: string; gameId: string }> };
    assert.deepEqual(publicMetadata.challengeProgress.completedChallengeIds, ["old", "new"]);
    assert.equal(publicMetadata.challengeAttempts.length, 1);
    assert.equal(publicMetadata.challengeAttempts[0].challengeId, "new");
    assert.equal(publicMetadata.challengeAttempts[0].gameId, "new-game");
    assert.equal(writes.filter((entry) => "privateMetadata" in entry.metadata).length, 1, "one group progress write is expected");
  });
}

test("dependency override registries reject production use", () => {
  const previous = process.env.NODE_ENV;
  setNodeEnv("production");
  try {
    assert.throws(() => webRoute.setWebRefreshRouteTestDependencies(null), /test-only/);
    assert.throws(() => mobileRoute.setMobileRefreshRouteTestDependencies(null), /test-only/);
  } finally {
    setNodeEnv(previous);
  }
});
