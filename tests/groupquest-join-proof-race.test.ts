import assert from "node:assert/strict";
import test from "node:test";

import * as webUpdateRoute from "../src/app/api/groupquests/[id]/route";
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

const unrelatedPendingReceipt = {
  id: `${baseQuest.id}:finish-any-game:multiplayer:chesscom:unrelated-proof:2026-07-02T11:01:00.000Z`,
  challengeId: "finish-any-game",
  gameId: "unrelated-proof",
  provider: "chesscom" as const,
  summary: "Unrelated proof passed",
  checkedAt: "2026-07-02T11:01:00.000Z",
  completedGameAt: "2026-07-02T11:00:00.000Z",
};

const unrelatedParticipant = {
  userId: "other-runner",
  provider: "chesscom" as const,
  username: "OtherRunner",
  leaderboardName: "Other Runner",
  joinedAt: "2026-07-01T00:00:00.000Z",
  score: 10,
  completedQuestIds: ["finish-any-game"],
  questFinishedAt: { "finish-any-game": unrelatedPendingReceipt.completedGameAt },
  pendingCompletions: [unrelatedPendingReceipt],
};

function assertUnrelatedParticipantPreserved(groupQuest: ServerGroupQuest) {
  const participant = groupQuest.participants.find(({ userId }) => userId === unrelatedParticipant.userId);
  assert.ok(participant);
  assert.equal(participant.provider, unrelatedParticipant.provider);
  assert.equal(participant.username, unrelatedParticipant.username);
  assert.equal(participant.leaderboardName, unrelatedParticipant.leaderboardName);
  assert.equal(participant.joinedAt, unrelatedParticipant.joinedAt);
  assert.equal(participant.score, unrelatedParticipant.score);
  assert.deepEqual(participant.completedQuestIds, unrelatedParticipant.completedQuestIds);
  assert.deepEqual(participant.questFinishedAt, unrelatedParticipant.questFinishedAt);
  assert.equal(participant.pendingCompletions?.length, 1);
  const receipt = participant.pendingCompletions?.[0];
  assert.ok(receipt);
  for (const [key, value] of Object.entries(unrelatedPendingReceipt)) {
    assert.deepEqual(receipt[key as keyof typeof receipt], value, key);
  }
}

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
    ["joiner-two", {
      id: "joiner-two",
      firstName: "Second",
      username: "joiner-two",
      publicMetadata: { lichessUsername: "SecondJoiner" },
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

test("concurrent web and mobile joins preserve both new hosted memberships", async () => {
  const emptyQuest = { ...structuredClone(baseQuest), participants: [] };
  const state = raceClient(emptyQuest);
  const readUser = state.client.users.getUser;
  let hostReads = 0;
  state.client.users.getUser = async (userId: string) => {
    const snapshot = await readUser(userId);
    if (userId === "host" && ++hostReads === 1) {
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    return snapshot;
  };
  const context = { params: Promise.resolve({ id: baseQuest.id }) };
  const findQuest = async () => ({ userId: "host", groupQuest: structuredClone(state.loadQuest()) });

  const webJoin = webJoinRoute.withWebJoinRouteTestDependencies({
    getAuthenticatedUserId: async () => "joiner",
    findQuestById: findQuest,
    getUser: state.client.users.getUser,
    saveJoinedQuest: (input) => webJoinRoute.saveWebJoinedQuest(state.client as never, input),
  }, () => webJoinRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }), context));
  const mobileJoin = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "joiner-two",
    getClient: async () => state.client,
    findQuest,
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "join" }),
  }), context));

  const [webResponse, mobileResponse] = await Promise.all([webJoin, mobileJoin]);
  assert.equal(webResponse.status, 200);
  assert.equal(mobileResponse.status, 200);
  assert.deepEqual(
    state.loadQuest().participants.map(({ userId }) => userId).sort(),
    ["joiner", "joiner-two"],
  );
});

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

test("mobile update rejects a participant replica before storage access", async () => {
  const state = raceClient();
  let writes = 0;
  const updateUserMetadata = state.client.users.updateUserMetadata;
  state.client.users.updateUserMetadata = async (...args) => {
    writes += 1;
    return updateUserMetadata(...args);
  };

  const response = await mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "replica-owner", groupQuest: structuredClone(state.loadQuest()) }),
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Replica edit" }),
  }), { params: Promise.resolve({ id: baseQuest.id }) }));

  assert.equal(response.status, 403);
  assert.equal((await response.json()).message, "Only the owner can change Multiplayer Side Quest settings.");
  assert.equal(writes, 0);
  assert.equal(state.loadQuest().name, baseQuest.name);
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

test("web proof persistence waits for an in-flight settings write", async () => {
  const state = raceClient({
    ...structuredClone(baseQuest),
    participants: [...structuredClone(baseQuest.participants), structuredClone(unrelatedParticipant)],
  });
  const originalGetUser = state.client.users.getUser;
  const originalUpdateUserMetadata = state.client.users.updateUserMetadata;
  let hostReads = 0;
  let signalEditWrite!: () => void;
  let releaseEditWrite!: () => void;
  const editWriteReached = new Promise<void>((resolve) => { signalEditWrite = resolve; });
  const editWriteGate = new Promise<void>((resolve) => { releaseEditWrite = resolve; });
  let heldEditWrite = false;

  state.client.users.getUser = async (userId: string) => {
    if (userId === "host") hostReads += 1;
    return originalGetUser(userId);
  };
  state.client.users.updateUserMetadata = async (userId: string, metadata: Record<string, unknown>) => {
    const storedQuest = userId === "host" && metadata.privateMetadata
      ? getStoredGroupQuests(metadata.privateMetadata)
        .find((quest) => quest.id === baseQuest.id)
      : undefined;
    if (!heldEditWrite && storedQuest?.name === "Serialized web edit") {
      heldEditWrite = true;
      signalEditWrite();
      await editWriteGate;
    }
    return originalUpdateUserMetadata(userId, metadata);
  };

  const context = { params: Promise.resolve({ id: baseQuest.id }) };
  const findQuest = async () => ({ userId: "host", groupQuest: structuredClone(state.loadQuest()) });
  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest,
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Serialized web edit" }),
  }), context));

  await editWriteReached;
  const readsBeforeRefresh = hostReads;
  const refresh = webRefreshRoute.withWebRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest,
    check: async () => ({
      status: "passed" as const,
      gameId: "serialized-web-proof",
      summary: "Serialized proof passed",
      gameTime: "2026-07-02T10:00:00.000Z",
    }),
  } as never, () => webRefreshRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/refresh`, {
    method: "POST",
  }), context));

  try {
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(hostReads, readsBeforeRefresh, "proof persistence must wait before its final host read");
  } finally {
    releaseEditWrite();
  }

  assert.equal((await edit).status, 200);
  assert.equal((await refresh).status, 200);
  const stored = state.loadQuest();
  assert.equal(stored.name, "Serialized web edit");
  assert.deepEqual(stored.participants[0].completedQuestIds, ["finish-any-game"]);
  assertUnrelatedParticipantPreserved(stored);
});

test("mobile proof persistence waits for an in-flight settings write", async () => {
  const state = raceClient({
    ...structuredClone(baseQuest),
    participants: [...structuredClone(baseQuest.participants), structuredClone(unrelatedParticipant)],
  });
  const originalGetUser = state.client.users.getUser;
  const originalUpdateUserMetadata = state.client.users.updateUserMetadata;
  let hostReads = 0;
  let signalEditWrite!: () => void;
  let releaseEditWrite!: () => void;
  const editWriteReached = new Promise<void>((resolve) => { signalEditWrite = resolve; });
  const editWriteGate = new Promise<void>((resolve) => { releaseEditWrite = resolve; });
  let heldEditWrite = false;

  state.client.users.getUser = async (userId: string) => {
    if (userId === "host") hostReads += 1;
    return originalGetUser(userId);
  };
  state.client.users.updateUserMetadata = async (userId: string, metadata: Record<string, unknown>) => {
    const storedQuest = userId === "host" && metadata.privateMetadata
      ? getStoredGroupQuests(metadata.privateMetadata)
        .find((quest) => quest.id === baseQuest.id)
      : undefined;
    if (!heldEditWrite && storedQuest?.name === "Serialized mobile edit") {
      heldEditWrite = true;
      signalEditWrite();
      await editWriteGate;
    }
    return originalUpdateUserMetadata(userId, metadata);
  };

  const context = { params: Promise.resolve({ id: baseQuest.id }) };
  const findQuest = async () => ({ userId: "host", groupQuest: structuredClone(state.loadQuest()) });
  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest,
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Serialized mobile edit" }),
  }), context));

  await editWriteReached;
  const readsBeforeRefresh = hostReads;
  const refresh = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest,
    check: async () => ({
      status: "passed" as const,
      gameId: "serialized-mobile-proof",
      summary: "Serialized proof passed",
      gameTime: "2026-07-02T10:00:00.000Z",
    }),
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "refresh" }),
  }), context));

  try {
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(hostReads, readsBeforeRefresh, "proof persistence must wait before its final host read");
  } finally {
    releaseEditWrite();
  }

  assert.equal((await edit).status, 200);
  assert.equal((await refresh).status, 200);
  const stored = state.loadQuest();
  assert.equal(stored.name, "Serialized mobile edit");
  assert.deepEqual(stored.participants[0].completedQuestIds, ["finish-any-game"]);
  assertUnrelatedParticipantPreserved(stored);
});

test("web settings edit preserves proof completed after the edit snapshot", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Edited race table" }),
  }), context));

  await editSnapshotted;
  const refresh = await webRefreshRoute.withWebRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => ({
      status: "passed" as const,
      gameId: "edit-race-proof",
      summary: "Concurrent proof passed",
      gameTime: "2026-07-02T10:00:00.000Z",
    }),
  } as never, () => webRefreshRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/refresh`, {
    method: "POST",
  }), context));
  assert.equal(refresh.status, 200);

  releaseEdit();
  assert.equal((await edit).status, 200);

  const stored = state.loadQuest();
  assert.equal(stored.name, "Edited race table");
  const runner = stored.participants.find(({ userId }) => userId === "runner")!;
  assert.deepEqual(runner.completedQuestIds, ["finish-any-game"]);
  assert.deepEqual(runner.questFinishedAt, { "finish-any-game": "2026-07-02T10:00:00.000Z" });
  assert.equal(runner.score, 10);
});

test("mobile settings edit preserves proof completed after the edit snapshot", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Edited mobile race table" }),
  }), context));

  await editSnapshotted;
  const refresh = await webRefreshRoute.withWebRefreshRouteTestDependencies({
    authenticate: async () => "runner",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: state.loadQuest() }),
    check: async () => ({
      status: "passed" as const,
      gameId: "mobile-edit-race-proof",
      summary: "Concurrent proof passed",
      gameTime: "2026-07-02T10:00:00.000Z",
    }),
  } as never, () => webRefreshRoute.POST(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}/refresh`, {
    method: "POST",
  }), context));
  assert.equal(refresh.status, 200);

  releaseEdit();
  assert.equal((await edit).status, 200);

  const stored = state.loadQuest();
  assert.equal(stored.name, "Edited mobile race table");
  const runner = stored.participants.find(({ userId }) => userId === "runner")!;
  assert.deepEqual(runner.completedQuestIds, ["finish-any-game"]);
  assert.deepEqual(runner.questFinishedAt, { "finish-any-game": "2026-07-02T10:00:00.000Z" });
  assert.equal(runner.score, 10);
});

test("web delayed provider edit reports a conflict for a newly incompatible participant", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ providerMode: "lichess" }),
  }), context));

  await editSnapshotted;
  const chessComParticipant = {
    userId: "joiner-two",
    provider: "chesscom" as const,
    username: "SecondJoiner",
    leaderboardName: "Second Joiner",
    joinedAt: "2026-07-02T00:00:00.000Z",
    score: 0,
    completedQuestIds: [] as string[],
    questFinishedAt: {},
  };
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), participants: [...state.loadQuest().participants, chessComParticipant] }],
    },
  });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "provider_locked");
  assert.equal(state.loadQuest().providerMode, "both");
  assert.equal(state.loadQuest().participants.some(({ userId }) => userId === "joiner-two"), true);
});

test("mobile delayed provider edit reports a conflict for a newly incompatible participant", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", providerMode: "lichess" }),
  }), context));

  await editSnapshotted;
  const chessComParticipant = {
    userId: "joiner-two",
    provider: "chesscom" as const,
    username: "SecondJoiner",
    leaderboardName: "Second Joiner",
    joinedAt: "2026-07-02T00:00:00.000Z",
    score: 0,
    completedQuestIds: [] as string[],
    questFinishedAt: {},
  };
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), participants: [...state.loadQuest().participants, chessComParticipant] }],
    },
  });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "provider_locked");
  assert.equal(state.loadQuest().providerMode, "both");
  assert.equal(state.loadQuest().participants.some(({ userId }) => userId === "joiner-two"), true);
});

test("web partial settings edit preserves omitted invite and provider modes", async () => {
  const state = raceClient({
    ...structuredClone(baseQuest),
    inviteMode: "private-key",
    inviteKey: "KEEP-ME",
    providerMode: "lichess",
    providerLabel: "Lichess only",
  });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const response = await webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: structuredClone(state.loadQuest()) }),
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Renamed private table" }),
  }), context));

  assert.equal(response.status, 200);
  assert.equal(state.loadQuest().name, "Renamed private table");
  assert.equal(state.loadQuest().inviteMode, "private-key");
  assert.equal(state.loadQuest().inviteKey, "keep-me");
  assert.equal(state.loadQuest().providerMode, "lichess");
  assert.equal(state.loadQuest().providerLabel, "Lichess only");
});

test("mobile partial settings edit preserves omitted invite and provider modes", async () => {
  const state = raceClient({
    ...structuredClone(baseQuest),
    inviteMode: "private-key",
    inviteKey: "KEEP-ME",
    providerMode: "lichess",
    providerLabel: "Lichess only",
  });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const response = await mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "host", groupQuest: structuredClone(state.loadQuest()) }),
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Renamed private mobile table" }),
  }), context));

  assert.equal(response.status, 200);
  assert.equal(state.loadQuest().name, "Renamed private mobile table");
  assert.equal(state.loadQuest().inviteMode, "private-key");
  assert.equal(state.loadQuest().inviteKey, "keep-me");
  assert.equal(state.loadQuest().providerMode, "lichess");
  assert.equal(state.loadQuest().providerLabel, "Lichess only");
});

test("web name-only edit preserves dates changed after the edit snapshot", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Fresh dates table" }),
  }), context));

  await editSnapshotted;
  const latestStartAt = "2026-07-03T00:00:00.000Z";
  const latestEndAt = "2099-07-21T00:00:00.000Z";
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), startAt: latestStartAt, endAt: latestEndAt }],
    },
  });
  releaseEdit();

  assert.equal((await edit).status, 200);
  assert.equal(state.loadQuest().name, "Fresh dates table");
  assert.equal(state.loadQuest().startAt, latestStartAt);
  assert.equal(state.loadQuest().endAt, latestEndAt);
});

test("mobile name-only edit preserves dates changed after the edit snapshot", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Fresh mobile dates table" }),
  }), context));

  await editSnapshotted;
  const latestStartAt = "2026-07-03T00:00:00.000Z";
  const latestEndAt = "2099-07-21T00:00:00.000Z";
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), startAt: latestStartAt, endAt: latestEndAt }],
    },
  });
  releaseEdit();

  assert.equal((await edit).status, 200);
  assert.equal(state.loadQuest().name, "Fresh mobile dates table");
  assert.equal(state.loadQuest().startAt, latestStartAt);
  assert.equal(state.loadQuest().endAt, latestEndAt);
});

test("web delayed edit reports a missing target without recreating it", async () => {
  const state = raceClient();
  const originalUpdateUserMetadata = state.client.users.updateUserMetadata;
  let writes = 0;
  state.client.users.updateUserMetadata = async (...args) => {
    writes += 1;
    return originalUpdateUserMetadata(...args);
  };
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Do not recreate" }),
  }), context));

  await editSnapshotted;
  await state.client.users.updateUserMetadata("host", { privateMetadata: { sqcGroupQuests: [] } });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "groupquest_update_target_missing");
  assert.equal(writes, 1);
  assert.equal(state.loadQuest(), undefined);
});

test("mobile delayed edit reports a missing target without recreating it", async () => {
  const state = raceClient();
  const originalUpdateUserMetadata = state.client.users.updateUserMetadata;
  let writes = 0;
  state.client.users.updateUserMetadata = async (...args) => {
    writes += 1;
    return originalUpdateUserMetadata(...args);
  };
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Do not recreate" }),
  }), context));

  await editSnapshotted;
  await state.client.users.updateUserMetadata("host", { privateMetadata: { sqcGroupQuests: [] } });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "groupquest_update_target_missing");
  assert.equal(writes, 1);
  assert.equal(state.loadQuest(), undefined);
});

test("web delayed edit rejects a changed canonical owner", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Stale owner edit" }),
  }), context));

  await editSnapshotted;
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), hostUserId: "replacement-host" }],
    },
  });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "groupquest_update_owner_changed");
  assert.equal(state.loadQuest().name, baseQuest.name);
  assert.equal(state.loadQuest().hostUserId, "replacement-host");
});

test("web delayed edit rejects a quest that finished after the edit snapshot", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
  } as never, () => webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Should not save" }),
  }), context));

  await editSnapshotted;
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), endAt: "2026-07-02T00:00:00.000Z" }],
    },
  });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "finished");
  assert.equal(state.loadQuest().name, baseQuest.name);
});

test("mobile delayed edit rejects a changed canonical owner", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Stale mobile owner edit" }),
  }), context));

  await editSnapshotted;
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), hostUserId: "replacement-host" }],
    },
  });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "groupquest_update_conflict");
  assert.equal(state.loadQuest().name, baseQuest.name);
  assert.equal(state.loadQuest().hostUserId, "replacement-host");
});

test("web update dependencies remain isolated across overlapping requests", async () => {
  let releaseFirst!: () => void;
  let signalFirst!: () => void;
  const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const firstStarted = new Promise<void>((resolve) => { signalFirst = resolve; });
  const authenticatedBy: string[] = [];
  const run = (id: string, blocked: boolean) => webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => {
      authenticatedBy.push(id);
      return null;
    },
    getClient: async () => { throw new Error("signed-out requests must not load a client"); },
    findQuest: async () => { throw new Error("signed-out requests must not load a quest"); },
  } as never, async () => {
    if (blocked) {
      signalFirst();
      await firstGate;
    }
    return webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "{}",
    }), { params: Promise.resolve({ id }) });
  });

  const first = run("first", true);
  await firstStarted;
  try {
    assert.equal((await run("second", false)).status, 401);
  } finally {
    releaseFirst();
  }
  assert.equal((await first).status, 401);
  assert.deepEqual(authenticatedBy, ["second", "first"]);
});

test("web update dependency overrides reject production entry and remain ignored by production PATCH", async () => {
  const setEnv = (value: string) => Object.defineProperty(process.env, "NODE_ENV", {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  setEnv("production");
  try {
    assert.throws(() => webUpdateRoute.withWebUpdateRouteTestDependencies({} as never, () => undefined), /test-only/);
  } finally {
    setEnv("test");
  }

  let injectedAuthCalls = 0;
  await webUpdateRoute.withWebUpdateRouteTestDependencies({
    authenticate: async () => {
      injectedAuthCalls += 1;
      return null;
    },
  } as never, async () => {
    setEnv("production");
    try {
      await webUpdateRoute.PATCH(new Request(`https://sqc.test/api/groupquests/${baseQuest.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: "{}",
      }), { params: Promise.resolve({ id: baseQuest.id }) });
    } catch {
      // Real Clerk request context is intentionally unavailable in this credential-free test.
    } finally {
      setEnv("test");
    }
  });
  assert.equal(injectedAuthCalls, 0);
});

test("mobile delayed edit rejects a quest that finished after the edit snapshot", async () => {
  const state = raceClient();
  let signalEditSnapshot!: () => void;
  let releaseEdit!: () => void;
  const editSnapshotted = new Promise<void>((resolve) => { signalEditSnapshot = resolve; });
  const editGate = new Promise<void>((resolve) => { releaseEdit = resolve; });
  const context = { params: Promise.resolve({ id: baseQuest.id }) };

  const edit = mobileRoute.withMobileRefreshRouteTestDependencies({
    authenticate: async () => "host",
    getClient: async () => state.client,
    findQuest: async () => {
      const snapshot = structuredClone(state.loadQuest());
      signalEditSnapshot();
      await editGate;
      return { userId: "host", groupQuest: snapshot };
    },
    check: async () => { throw new Error("not a proof request"); },
  } as never, () => mobileRoute.POST(new Request(`https://sqc.test/api/mobile/groupquests/${baseQuest.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "update", name: "Should not save" }),
  }), context));

  await editSnapshotted;
  await state.client.users.updateUserMetadata("host", {
    privateMetadata: {
      sqcGroupQuests: [{ ...state.loadQuest(), endAt: "2026-07-02T00:00:00.000Z" }],
    },
  });
  releaseEdit();

  const response = await edit;
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "groupquest_update_conflict");
  assert.equal(state.loadQuest().name, baseQuest.name);
});
