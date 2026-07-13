import assert from "node:assert/strict";
import test from "node:test";
import * as webRoute from "../src/app/api/groupquests/[id]/refresh/route";
import * as mobileRoute from "../src/app/api/mobile/groupquests/[id]/route";
import { OFFICIAL_GROUP_QUEST_METADATA_KEY, getBuiltInOfficialGroupQuests } from "../src/lib/groupquests";

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

function deepMerge(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...target };
  for (const [key, value] of Object.entries(patch)) {
    merged[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(merged[key] && typeof merged[key] === "object" && !Array.isArray(merged[key]) ? merged[key] as Record<string, unknown> : {}, value as Record<string, unknown>)
      : value;
  }
  return merged;
}

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
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
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
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body.completedQuestIds, ["old", "new"]);
    assert.equal(body.score, 150);
    const publicWrites = writes.filter((entry) => "publicMetadata" in entry.metadata);
    assert.equal(publicWrites.length, 1, "one completion metadata write is expected");
    const publicMetadata = publicWrites[0].metadata.publicMetadata as { challengeProgress: { completedChallengeIds: string[] }; challengeAttempts: Array<{ challengeId: string; gameId: string }> };
    assert.deepEqual(Object.keys(publicMetadata).sort(), ["challengeAttempts", "challengeProgress"], "completion writes only changed challenge keys");
    assert.deepEqual(publicMetadata.challengeProgress.completedChallengeIds, ["old", "new"]);
    assert.equal(publicMetadata.challengeAttempts.length, 1);
    assert.equal(publicMetadata.challengeAttempts[0].challengeId, "new");
    assert.equal(publicMetadata.challengeAttempts[0].gameId, "new-game");
    assert.equal(writes.filter((entry) => "privateMetadata" in entry.metadata).length, 1, "one group progress write is expected");
  });
}

for (const variant of ["web", "mobile"] as const) {
  test(`${variant} official refresh writes compact group progress to public metadata`, async () => {
    const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];
    const client = fakeClient(writes);
    const officialQuest = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
    officialQuest.participants = [{
      userId: "current", provider: "chesscom", username: "CurrentChess", leaderboardName: "Current",
      joinedAt: "2026-07-01T00:00:00.000Z", completedQuestIds: [], questFinishedAt: {}, score: 0,
    }];
    const dependencies = {
      authenticate: async () => "current",
      getClient: async () => client,
      findQuest: async () => ({ userId: "official-sqc", groupQuest: officialQuest }),
      check: async ({ challengeId }: { challengeId: string }) => ({
        status: "passed" as const,
        gameId: `${challengeId}-game`,
        summary: `${challengeId} passed`,
        gameTime: "2026-07-03T00:00:00.000Z",
      }),
    };
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));

    assert.equal(response.status, 200);
    assert.equal(writes.some((entry) => "privateMetadata" in entry.metadata), false);
    assert.equal(writes.some((entry) => {
      const metadata = entry.metadata.publicMetadata as Record<string, unknown> | undefined;
      const records = metadata?.[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, unknown> | undefined;
      return Boolean(records?.[officialQuest.id]);
    }), true);
    const finalPublicMetadata = writes.reduce((state, write) => deepMerge(
      state,
      (write.metadata.publicMetadata as Record<string, unknown> | undefined) ?? {},
    ), { concurrentProfileField: { survives: true } } as Record<string, unknown>);
    assert.equal((finalPublicMetadata.concurrentProfileField as Record<string, unknown>).survives, true);
    assert.equal(Boolean((finalPublicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, unknown>)[officialQuest.id]), true);
    assert.deepEqual((finalPublicMetadata.challengeProgress as { completedChallengeIds: string[] }).completedChallengeIds, ["old", ...officialQuest.questIds]);
    assert.equal(Array.isArray(finalPublicMetadata.challengeAttempts), true);
  });
}

for (const variant of ["web", "mobile"] as const) {
  test(`${variant} exported POST keeps overlapping test dependencies request-scoped`, async () => {
    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>((resolve) => { releaseFirst = resolve; });
    let firstStarted!: () => void;
    const firstAtCheck = new Promise<void>((resolve) => { firstStarted = resolve; });

    const run = (label: string, block: boolean) => {
      const dependencies = {
        authenticate: async () => "current",
        getClient: async () => fakeClient([]),
        findQuest: async () => ({ userId: "host", groupQuest: structuredClone(baseQuest) }),
        check: async ({ challengeId }: { challengeId: string }) => {
          if (block && challengeId === "old") {
            firstStarted();
            await firstBlocked;
          }
          return { ...mismatch, gameId: `${label}-${challengeId}`, summary: `${label}-${challengeId}` };
        },
      };
      return variant === "web"
        ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
        : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }));
    };

    const first = run("first", true);
    await firstAtCheck;
    const secondBody = await (await run("second", false)).json();
    releaseFirst();
    const firstBody = await (await first).json();

    assert.deepEqual(firstBody.checks.map((entry: { gameId: string }) => entry.gameId), ["first-old", "first-new"]);
    assert.deepEqual(secondBody.checks.map((entry: { gameId: string }) => entry.gameId), ["second-old", "second-new"]);
  });
}

test("test dependency contexts reject production use and exported POST ignores stale context", async () => {
  const previous = process.env.NODE_ENV;
  setNodeEnv("production");
  try {
    assert.throws(() => webRoute.withWebRefreshRouteTestDependencies({} as never, () => undefined), /test-only/);
    assert.throws(() => mobileRoute.withMobileRefreshRouteTestDependencies({} as never, () => undefined), /test-only/);
  } finally {
    setNodeEnv(previous);
  }

  for (const variant of ["web", "mobile"] as const) {
    let injectedAuthCalls = 0;
    const dependencies = { authenticate: async () => { injectedAuthCalls += 1; return null; } } as never;
    await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies, async () => {
          setNodeEnv("production");
          try { await webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }); } catch { /* Production dependencies may need runtime configuration. */ }
          finally { setNodeEnv("test"); }
        })
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies, async () => {
          setNodeEnv("production");
          try { await mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }); } catch { /* Production dependencies may need runtime configuration. */ }
          finally { setNodeEnv("test"); }
        }));
    assert.equal(injectedAuthCalls, 0, `${variant} production POST must not consult stale test context`);
  }
});
