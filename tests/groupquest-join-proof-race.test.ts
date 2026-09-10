import assert from "node:assert/strict";
import test from "node:test";

import * as webJoinRoute from "../src/app/api/groupquests/[id]/join/route";
import * as webRefreshRoute from "../src/app/api/groupquests/[id]/refresh/route";
import * as mobileRoute from "../src/app/api/mobile/groupquests/[id]/route";
import { getStoredGroupQuests, type ServerGroupQuest } from "../src/lib/groupquests";

Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true,
  configurable: true,
  enumerable: true,
});

const baseQuest: ServerGroupQuest = {
  id: "race-table",
  hostUserId: "host",
  hostName: "Host",
  name: "Race table",
  inviteCopy: "Join the race.",
  inviteMode: "public",
  questIds: ["finish-any-game"],
  providerMode: "both",
  providerLabel: "Lichess or Chess.com",
  startAt: "2026-07-01T00:00:00.000Z",
  endAt: "2099-07-20T00:00:00.000Z",
  rules: {},
  createdAt: "2026-07-01T00:00:00.000Z",
  participants: [{
    userId: "runner",
    provider: "lichess",
    username: "ProofRunner",
    leaderboardName: "Proof Runner",
    joinedAt: "2026-07-01T00:00:00.000Z",
    score: 0,
    completedQuestIds: [],
    questFinishedAt: {},
  }],
};

type StoredUser = {
  id: string;
  firstName: string;
  username: string;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
};

function deepMerge(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(patch)) {
    result[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(result[key] && typeof result[key] === "object" && !Array.isArray(result[key])
        ? result[key] as Record<string, unknown>
        : {}, value as Record<string, unknown>)
      : structuredClone(value);
  }
  return result;
}

function raceClient(initialQuest: ServerGroupQuest = baseQuest) {
  const users = new Map<string, StoredUser>([
    ["host", {
      id: "host",
      firstName: "Host",
      username: "host",
      publicMetadata: {},
      privateMetadata: { sqcGroupQuests: [structuredClone(initialQuest)] },
    }],
    ["runner", {
      id: "runner",
      firstName: "Proof",
      username: "runner",
      publicMetadata: { lichessUsername: "ProofRunner", challengeProgress: { completedChallengeIds: [] }, challengeAttempts: [] },
      privateMetadata: {},
    }],
    ["joiner", {
      id: "joiner",
      firstName: "New",
      username: "joiner",
      publicMetadata: { lichessUsername: "NewJoiner" },
      privateMetadata: {},
    }],
  ]);

  const client = {
    users: {
      getUser: async (userId: string) => structuredClone(users.get(userId)!),
      updateUserMetadata: async (userId: string, metadata: Record<string, unknown>) => {
        const user = users.get(userId)!;
        if (metadata.publicMetadata && typeof metadata.publicMetadata === "object") {
          user.publicMetadata = deepMerge(user.publicMetadata, metadata.publicMetadata as Record<string, unknown>);
        }
        if (metadata.privateMetadata && typeof metadata.privateMetadata === "object") {
          user.privateMetadata = deepMerge(user.privateMetadata, metadata.privateMetadata as Record<string, unknown>);
        }
      },
    },
  };

  return {
    client,
    loadQuest: () => getStoredGroupQuests(users.get("host")!.privateMetadata)[0],
  };
}

test("web join preserves proof completed after the join snapshot", async () => {
  const state = raceClient();
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = webJoinRoute.withWebJoinRouteTestDependencies({
    getAuthenticatedUserId: async () => "joiner",
    findQuestById: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    getUser: state.client.users.getUser,
    saveJoinedQuest: (input) => webJoinRoute.saveWebJoinedQuest(state.client as never, input),
  }, () => webJoinRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }), context));

  await joinSnapshotted;
  const refresh = await webRefreshRoute.withWebRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => ({
      status: "passed" as const,
      gameId: "race-proof",
      summary: "Concurrent proof passed",
      gameTime: "2026-07-02T10:00:00.000Z",
    }),
  } as never, () => webRefreshRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/refresh`, {
    method: "POST",
  }), context));
  assert.equal(refresh.status, 200);

  releaseJoin();
  assert.equal((await join).status, 200);

  const stored = state.loadQuest();
  assert.equal(stored.participants.some(({ userId }) => userId === "joiner"), true);
  const runner = stored.participants.find(({ userId }) => userId === "runner")!;
  assert.deepEqual(runner.completedQuestIds, ["finish-any-game"]);
  assert.deepEqual(runner.questFinishedAt, { "finish-any-game": "2026-07-02T10:00:00.000Z" });
  assert.equal(runner.score, 10);
});

test("mobile join preserves proof completed after the join snapshot", async () => {
  const state = raceClient();
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "joiner",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "join" }),
  }), context));

  await joinSnapshotted;
  const refresh = await mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => ({
      status: "passed" as const,
      gameId: "race-proof",
      summary: "Concurrent proof passed",
      gameTime: "2026-07-02T10:00:00.000Z",
    }),
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "refresh" }),
  }), context));
  assert.equal(refresh.status, 200);

  releaseJoin();
  assert.equal((await join).status, 200);

  const stored = state.loadQuest();
  assert.equal(stored.participants.some(({ userId }) => userId === "joiner"), true);
  const runner = stored.participants.find(({ userId }) => userId === "runner")!;
  assert.deepEqual(runner.completedQuestIds, ["finish-any-game"]);
  assert.deepEqual(runner.questFinishedAt, { "finish-any-game": "2026-07-02T10:00:00.000Z" });
  assert.equal(runner.score, 10);
});

test("web rejoin does not restore a receipt acknowledged after the join snapshot", async () => {
  const receipt = {
    id: `${baseQuest.id}:finish-any-game:multiplayer:lichess:race-proof:2026-07-02T10:01:00.000Z`,
    challengeId: "finish-any-game",
    gameId: "race-proof",
    provider: "lichess" as const,
    summary: "Concurrent proof passed",
    checkedAt: "2026-07-02T10:01:00.000Z",
    completedGameAt: "2026-07-02T10:00:00.000Z",
  };
  const pendingQuest = structuredClone(baseQuest);
  pendingQuest.participants[0] = {
    ...pendingQuest.participants[0],
    score: 10,
    completedQuestIds: ["finish-any-game"],
    questFinishedAt: { "finish-any-game": receipt.completedGameAt },
    pendingCompletions: [receipt],
  };
  const state = raceClient(pendingQuest);
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = webJoinRoute.withWebJoinRouteTestDependencies({
    getAuthenticatedUserId: async () => "runner",
    findQuestById: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    getUser: state.client.users.getUser,
    saveJoinedQuest: (input) => webJoinRoute.saveWebJoinedQuest(state.client as never, input),
  }, () => webJoinRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }), context));

  await joinSnapshotted;
  const refresh = await webRefreshRoute.withWebRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => { throw new Error("pending reconciliation must not read fresh proof"); },
  } as never, () => webRefreshRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/refresh`, {
    method: "POST",
  }), context));
  assert.equal(refresh.status, 200);
  assert.deepEqual(state.loadQuest().participants[0].pendingCompletions ?? [], []);

  releaseJoin();
  assert.equal((await join).status, 200);
  assert.deepEqual(state.loadQuest().participants[0].pendingCompletions ?? [], []);
});

test("web stale rejoin conflicts when the snapshotted membership was removed", async () => {
  const receipt = {
    id: `${baseQuest.id}:finish-any-game:multiplayer:lichess:race-proof:2026-07-02T10:01:00.000Z`,
    challengeId: "finish-any-game",
    gameId: "race-proof",
    provider: "lichess" as const,
    summary: "Concurrent proof passed",
    checkedAt: "2026-07-02T10:01:00.000Z",
    completedGameAt: "2026-07-02T10:00:00.000Z",
  };
  const pendingQuest = structuredClone(baseQuest);
  pendingQuest.participants[0] = {
    ...pendingQuest.participants[0],
    score: 10,
    completedQuestIds: ["finish-any-game"],
    questFinishedAt: { "finish-any-game": receipt.completedGameAt },
    pendingCompletions: [receipt],
  };
  const state = raceClient(pendingQuest);
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = webJoinRoute.withWebJoinRouteTestDependencies({
    getAuthenticatedUserId: async () => "runner",
    findQuestById: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    getUser: state.client.users.getUser,
    saveJoinedQuest: (input) => webJoinRoute.saveWebJoinedQuest(state.client as never, input),
  }, () => webJoinRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }), context));

  await joinSnapshotted;
  const refresh = await webRefreshRoute.withWebRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => { throw new Error("pending reconciliation must not read fresh proof"); },
  } as never, () => webRefreshRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/refresh`, {
    method: "POST",
  }), context));
  assert.equal(refresh.status, 200);
  assert.deepEqual(state.loadQuest().participants[0].pendingCompletions ?? [], []);

  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), participants: [] }],
    },
  });
  releaseJoin();

  const response = await join;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "groupquest_membership_changed");
  assert.deepEqual(state.loadQuest().participants, []);
});

test("web stale rejoin reports a conflict when the hosted quest was removed", async () => {
  const state = raceClient();
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = webJoinRoute.withWebJoinRouteTestDependencies({
    getAuthenticatedUserId: async () => "runner",
    findQuestById: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    getUser: state.client.users.getUser,
    saveJoinedQuest: (input) => webJoinRoute.saveWebJoinedQuest(state.client as never, input),
  }, () => webJoinRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }), context));

  await joinSnapshotted;
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: { sqcGroupQuests: [] },
  });
  releaseJoin();

  const response = await join;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "groupquest_join_target_missing");
  assert.equal(state.loadQuest(), undefined);
});

test("mobile stale rejoin conflicts when the snapshotted membership was removed", async () => {
  const receipt = {
    id: `${baseQuest.id}:finish-any-game:multiplayer:lichess:race-proof:2026-07-02T10:01:00.000Z`,
    challengeId: "finish-any-game",
    gameId: "race-proof",
    provider: "lichess" as const,
    summary: "Concurrent proof passed",
    checkedAt: "2026-07-02T10:01:00.000Z",
    completedGameAt: "2026-07-02T10:00:00.000Z",
  };
  const pendingQuest = structuredClone(baseQuest);
  pendingQuest.participants[0] = {
    ...pendingQuest.participants[0],
    score: 10,
    completedQuestIds: ["finish-any-game"],
    questFinishedAt: { "finish-any-game": receipt.completedGameAt },
    pendingCompletions: [receipt],
  };
  const state = raceClient(pendingQuest);
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "join" }),
  }), context));

  await joinSnapshotted;
  const refresh = await mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => { throw new Error("pending reconciliation must not read fresh proof"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "refresh" }),
  }), context));
  assert.equal(refresh.status, 200);
  assert.deepEqual(state.loadQuest().participants[0].pendingCompletions ?? [], []);

  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), participants: [] }],
    },
  });
  releaseJoin();

  const response = await join;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "groupquest_membership_changed");
  assert.deepEqual(state.loadQuest().participants, []);
});

test("mobile stale rejoin reports a conflict when the hosted quest was removed", async () => {
  const state = raceClient();
  let signalJoinSnapshot!: () => void;
  let releaseJoin!: () => void;
  const joinSnapshotted = new Promise<void>((resolve) => { signalJoinSnapshot = resolve; });
  const joinGate = new Promise<void>((resolve) => { releaseJoin = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const join = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalJoinSnapshot();
      await joinGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "join" }),
  }), context));

  await joinSnapshotted;
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: { sqcGroupQuests: [] },
  });
  releaseJoin();

  const response = await join;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "groupquest_join_target_missing");
  assert.equal(state.loadQuest(), undefined);
});

test("mobile join reports a capacity conflict discovered at persistence", async () => {
  const participant = (index: number) => ({
    userId: `player-${index}`,
    provider: "lichess" as const,
    username: `Player${index}`,
    leaderboardName: `Player ${index}`,
    joinedAt: "2026-07-01T00:00:00.000Z",
    score: 0,
    completedQuestIds: [] as string[],
    questFinishedAt: {},
  });
  const staleQuest = { ...structuredClone(baseQuest), participants: Array.from({ length: 79 }, (_, index) => participant(index)) };
  const currentQuest = { ...structuredClone(staleQuest), participants: [...staleQuest.participants, participant(79)] };
  const state = raceClient(currentQuest);
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const response = await mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "joiner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: structuredClone(staleQuest) }),
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "join" }),
  }), context));

  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "groupquest_full");
  assert.equal(state.loadQuest().participants.length, 80);
  assert.equal(state.loadQuest().participants.some(({ userId }) => userId === "joiner"), false);
});
