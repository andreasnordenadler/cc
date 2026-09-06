import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import * as groupquests from "../src/lib/groupquests";

// Evaluate the real, unmodified web PATCH export with only Clerk I/O replaced.
// This route is outside the bounded production edit allowlist.
function webUpdateRoute(dependencies: { client: unknown; findQuest: () => unknown }) {
  const source = readFileSync(new URL("../src/app/api/groupquests/[id]/route.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const require = createRequire(import.meta.url);
  const routeModule = { exports: {} as { PATCH: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response> } };
  new Function("require", "module", "exports", outputText)((id: string) => {
    if (id === "@clerk/nextjs/server") return { auth: async () => ({ userId: "host" }), clerkClient: async () => dependencies.client };
    if (id === "@/lib/groupquests") return { ...groupquests, findGroupQuestById: dependencies.findQuest };
    return require(id);
  }, routeModule, routeModule.exports);
  return routeModule.exports;
}

function acceptedReceipt(groupQuestId = "gq", challengeId = "new", provider: "lichess" | "chesscom" = "chesscom") {
  return {
    id: `${groupQuestId}:${challengeId}:multiplayer:${provider}:accepted-game:2099-07-02T05:06:07.000Z`,
    challengeId, gameId: "accepted-game", provider,
    summary: "Accepted proof", checkedAt: "2099-07-02T05:06:07.000Z",
    completedGameAt: "2099-07-02T04:05:06.000Z",
  };
}

function acceptReceipt(record: Record<string, unknown>, groupQuestId = "gq", challengeId = "new") {
  assert.ok(record.provider === "lichess" || record.provider === "chesscom");
  const receipt = acceptedReceipt(groupQuestId, challengeId, record.provider);
  record.completedQuestIds = [challengeId];
  record.questFinishedAt = { [challengeId]: receipt.completedGameAt };
  record.pendingCompletions = [receipt];
  assert.equal(normalizePendingGroupQuestCompletions(record.pendingCompletions, {
    groupQuestId, participantProvider: record.provider as "lichess" | "chesscom",
    acceptedChallengeIds: new Set(record.completedQuestIds as string[]),
    acceptedCompletionTimes: record.questFinishedAt as Record<string, string>,
  }).length, 1, "negative fixtures must start from a reconcilable receipt");
  return receipt;
}
import * as webJoinRoute from "../src/app/api/groupquests/[id]/join/route";
import * as webRoute from "../src/app/api/groupquests/[id]/refresh/route";
import * as mobileRoute from "../src/app/api/mobile/groupquests/[id]/route";
import {
  OFFICIAL_GROUP_QUEST_METADATA_KEY,
  getBuiltInOfficialGroupQuests,
  getStoredGroupQuests,
  getStoredOfficialGroupQuestParticipations,
  updateParticipantProgress,
  upsertHostGroupQuest,
  upsertOfficialGroupQuestParticipation,
} from "../src/lib/groupquests";
import {
  buildMultiplayerCompletionAccountPatch,
  buildPendingGroupQuestCompletions,
  normalizePendingGroupQuestCompletions,
} from "../src/lib/groupquest-completion-reconciliation";

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
  endAt: "2099-07-20T00:00:00.000Z",
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

function request(groupQuestId = "gq") {
  return new Request(`https://sqc.test/api/groupquests/${groupQuestId}/refresh`, {
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

function statefulHostedClient(failFirstAccountWrite = true) {
  const users = new Map<string, {
    id: string;
    firstName: string;
    username: string;
    publicMetadata: Record<string, unknown>;
    privateMetadata: Record<string, unknown>;
  }>([
    ["host", {
      id: "host",
      firstName: "Host",
      username: "host",
      publicMetadata: {},
      privateMetadata: { sqcGroupQuests: [structuredClone(baseQuest)] },
    }],
    ["current", {
      id: "current",
      firstName: "Current",
      username: "current",
      publicMetadata: {
        concurrentProfileField: { survives: true },
        challengeProgress: { completedChallengeIds: ["old"] },
        challengeAttempts: [],
      },
      privateMetadata: {},
    }],
  ]);
  let failNextAccountWrite = failFirstAccountWrite;
  const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];

  return {
    writes,
    expireQuest() {
      const host = users.get("host")!;
      const quests = host.privateMetadata.sqcGroupQuests as Array<Record<string, unknown>>;
      quests[0].endAt = "2026-07-04T00:00:00.000Z";
    },
    user(userId: string) {
      return structuredClone(users.get(userId)!);
    },
    setHostPrivateMetadata(value: Record<string, unknown>) {
      users.get("host")!.privateMetadata = structuredClone(value);
    },
    client: {
      users: {
        getUser: async (userId: string) => structuredClone(users.get(userId)!),
        updateUserMetadata: async (userId: string, metadata: Record<string, unknown>) => {
          writes.push({ userId, metadata: structuredClone(metadata) });
          const publicMetadata = metadata.publicMetadata && typeof metadata.publicMetadata === "object"
            ? metadata.publicMetadata as Record<string, unknown>
            : null;
          if (userId === "current" && publicMetadata && "challengeProgress" in publicMetadata && failNextAccountWrite) {
            failNextAccountWrite = false;
            throw new Error("injected account completion failure");
          }
          const user = users.get(userId)!;
          if (metadata.publicMetadata && typeof metadata.publicMetadata === "object") {
            user.publicMetadata = deepMerge(user.publicMetadata, metadata.publicMetadata as Record<string, unknown>);
          }
          if (metadata.privateMetadata && typeof metadata.privateMetadata === "object") {
            user.privateMetadata = deepMerge(user.privateMetadata, metadata.privateMetadata as Record<string, unknown>);
          }
        },
      },
    },
  };
}

function statefulOfficialClient(groupQuestId: string, failFirstAccountWrite = true) {
  const user = {
    id: "current",
    firstName: "Current",
    username: "current",
    publicMetadata: {
      concurrentProfileField: { survives: true },
      challengeProgress: { completedChallengeIds: ["old"] },
      challengeAttempts: [] as unknown[],
      [OFFICIAL_GROUP_QUEST_METADATA_KEY]: {
        [groupQuestId]: {
          active: true,
          left: false,
          provider: "chesscom",
          username: "CurrentChess",
          leaderboardName: "Current",
          joinedAt: "2099-07-01T00:00:00.000Z",
        },
      },
    } as Record<string, unknown>,
    privateMetadata: {} as Record<string, unknown>,
  };
  let failNextAccountWrite = failFirstAccountWrite;
  const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];

  return {
    writes,
    user: () => structuredClone(user),
    setPublicMetadata(value: Record<string, unknown>) {
      user.publicMetadata = structuredClone(value);
    },
    client: {
      users: {
        getUser: async () => structuredClone(user),
        updateUserMetadata: async (userId: string, metadata: Record<string, unknown>) => {
          writes.push({ userId, metadata: structuredClone(metadata) });
          const publicMetadata = metadata.publicMetadata && typeof metadata.publicMetadata === "object"
            ? metadata.publicMetadata as Record<string, unknown>
            : null;
          if (publicMetadata && "challengeProgress" in publicMetadata && failNextAccountWrite) {
            failNextAccountWrite = false;
            throw new Error("injected account completion failure");
          }
          if (publicMetadata) user.publicMetadata = deepMerge(user.publicMetadata, publicMetadata);
        },
      },
    },
  };
}

for (const variant of ["web", "mobile"] as const) {
  for (const storage of ["hosted", "official"] as const) {
    test(`${variant} ${storage} exported rejoin preserves pending receipt identity until refresh reconciles once`, async () => {
      const groupQuestId = storage === "official" ? "official-starter-shield-2099-07-01" : "gq";
      const hosted = statefulHostedClient(false);
      const official = statefulOfficialClient(groupQuestId, false);
      const state = storage === "official" ? official : hosted;
      const account = () => storage === "official" ? official.user() : hosted.user("current");
      const loadQuest = () => storage === "official"
        ? getStoredOfficialGroupQuestParticipations(account().publicMetadata, "current")[0]
        : getStoredGroupQuests(hosted.user("host").privateMetadata)[0];
      const initial = loadQuest();
      const challengeId = storage === "official" ? initial.questIds[0] : "new";
      const participant = initial.participants.find((entry) => entry.userId === "current")!;
      const receipt = acceptReceipt(participant, groupQuestId, challengeId);
      const pendingBefore = structuredClone(participant.pendingCompletions);
      if (storage === "official") {
        official.setPublicMetadata(deepMerge(account().publicMetadata, {
          [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation(account().publicMetadata, initial, "current"),
        }));
      } else {
        hosted.setHostPrivateMetadata({ sqcGroupQuests: [initial] });
      }
      await state.client.users.updateUserMetadata("current", {
        publicMetadata: { lichessUsername: "CurrentLichess", chessComUsername: "CurrentChess" },
      });
      state.writes.length = 0;
      assert.equal(loadQuest().participants.find((entry) => entry.userId === "current")!.pendingCompletions?.length, 1);
      let checkCalls = 0;
      const findQuest = async () => ({ userId: storage === "official" ? "official-sqc" : "host", groupQuest: loadQuest() });
      const dependencies = {
        authenticate: async () => "current",
        getClient: async () => state.client,
        findQuest,
        check: async () => {
          checkCalls += 1;
          return mismatch;
        },
      };
      const joinRequest = new Request(`https://sqc.test/api/groupquests/${groupQuestId}/join`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "join" }),
      });
      const context = { params: Promise.resolve({ id: groupQuestId }) };
      const joined = await (variant === "web"
        ? webJoinRoute.withWebJoinRouteTestDependencies({
            getAuthenticatedUserId: async () => "current",
            findQuestById: findQuest,
            getUser: state.client.users.getUser,
            saveJoinedQuest: (input) => webJoinRoute.saveWebJoinedQuest(state.client, input),
          }, () => webJoinRoute.POST(joinRequest, context))
        : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(joinRequest, context)));
      assert.equal(joined.status, 200);
      const rejoined = loadQuest().participants.find((entry) => entry.userId === "current")!;
      assert.equal(rejoined.provider, "chesscom", "rejoin must not rebind accepted Chess.com proof to Lichess");
      assert.equal(rejoined.username, "CurrentChess", "the preserved provider must retain its matching username");
      assert.deepEqual(rejoined.pendingCompletions, normalizePendingGroupQuestCompletions(pendingBefore));
      assert.deepEqual(rejoined.completedQuestIds, participant.completedQuestIds);
      assert.deepEqual(rejoined.questFinishedAt, participant.questFinishedAt);
      assert.equal(rejoined.score, participant.score);
      const refresh = () => variant === "web"
        ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), context))
        : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), context));
      const reconciled = await refresh();
      assert.equal(reconciled.status, 200);
      assert.deepEqual((await reconciled.json()).newlyPassedQuestIds, []);
      assert.equal(checkCalls, 0, "pending reconciliation must not require fresh proof");
      const attempts = account().publicMetadata.challengeAttempts as Array<Record<string, unknown>>;
      assert.equal(attempts.length, 1);
      assert.equal(attempts[0].id, receipt.id);
      assert.equal(attempts[0].provider, "chess.com");
      assert.ok((account().publicMetadata.challengeProgress as { completedChallengeIds: string[] }).completedChallengeIds.includes(challengeId));
      assert.deepEqual(loadQuest().participants.find((entry) => entry.userId === "current")!.pendingCompletions ?? [], []);
      const writesBeforeRetry = state.writes.length;
      assert.equal((await refresh()).status, 200);
      assert.equal(state.writes.length, writesBeforeRetry);
      assert.deepEqual(account().publicMetadata.challengeAttempts, attempts);
      assert.equal(state.writes.filter((entry) => {
        const metadata = entry.metadata.publicMetadata as Record<string, unknown> | undefined;
        return metadata && "challengeAttempts" in metadata;
      }).length, 1, "only one account completion projection is persisted");
    });
  }
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
    const groupWrites = writes.filter((entry) => "privateMetadata" in entry.metadata);
    assert.equal(groupWrites.length, 2, "each adapter durably records then acknowledges the completion receipt");
    const firstQuest = ((groupWrites[0].metadata.privateMetadata as { sqcGroupQuests: Array<{ participants: Array<{ pendingCompletions?: unknown[] }> }> }).sqcGroupQuests[0]);
    const acknowledgedQuest = ((groupWrites[1].metadata.privateMetadata as { sqcGroupQuests: Array<{ participants: Array<{ pendingCompletions?: unknown[] }> }> }).sqcGroupQuests[0]);
    assert.equal(firstQuest.participants.find((entry) => entry.pendingCompletions)?.pendingCompletions?.length, 1);
    assert.equal(acknowledgedQuest.participants.some((entry) => entry.pendingCompletions?.length), false);
  });
}

for (const variant of ["web", "mobile"] as const) {
test(`${variant} hosted completion reconciles the original receipt after account persistence fails and the quest ends`, async () => {
  const state = statefulHostedClient();
  let proofAttempt = 0;
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => {
      const quest = getStoredGroupQuests(state.user("host").privateMetadata).find((entry) => entry.id === "gq");
      return quest ? { userId: "host", groupQuest: quest } : null;
    },
    check: async ({ challengeId }: { challengeId: string }) => {
      if (challengeId === "old") return mismatch;
      proofAttempt += 1;
      return proofAttempt === 1
        ? {
            status: "passed" as const,
            gameId: "original-game",
            summary: "Original game passed",
            gameTime: "2026-07-03T04:05:06.000Z",
            finalPositionFen: "8/8/8/8/8/8/8/K6k b - - 7 42",
            lastMoveUci: "a2a1",
            lastMoveSan: "Ka1",
          }
        : { ...mismatch, status: "pending" as const, gameId: "newer-game", summary: "Original game is no longer latest" };
    },
  };

  await assert.rejects(
    variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })),
    /injected account completion failure/,
  );

  const afterFailure = getStoredGroupQuests(state.user("host").privateMetadata)[0];
  const failedParticipant = afterFailure.participants.find((entry) => entry.userId === "current")! as typeof baseQuest.participants[number] & {
    pendingCompletions?: Array<{ gameId: string }>;
  };
  assert.deepEqual(failedParticipant.completedQuestIds, ["old", "new"]);
  assert.equal(failedParticipant.score, 150);
  assert.equal(failedParticipant.pendingCompletions?.[0]?.gameId, "original-game");
  assert.deepEqual((state.user("current").publicMetadata.challengeProgress as { completedChallengeIds: string[] }).completedChallengeIds, ["old"]);
  state.expireQuest();

  let crowdedMetadata = state.user("host").privateMetadata;
  const fillerQuest = (id: string) => ({
    ...structuredClone(afterFailure),
    id,
    participants: afterFailure.participants.map((participant) => ({ ...participant, pendingCompletions: [] })),
  });
  for (let index = 1; index <= 3; index += 1) {
    crowdedMetadata = { ...crowdedMetadata, sqcGroupQuests: upsertHostGroupQuest(crowdedMetadata, fillerQuest(`filler-${index}`)) };
  }
  state.setHostPrivateMetadata(crowdedMetadata);
  assert.throws(
    () => upsertHostGroupQuest(crowdedMetadata, fillerQuest("filler-4")),
    /groupquest_pending_completion_history/,
  );
  assert.equal(getStoredGroupQuests(state.user("host").privateMetadata).find((entry) => entry.id === "gq")
    ?.participants.find((entry) => entry.userId === "current")?.pendingCompletions?.length, 1,
    "capacity pressure must retain the only durable recovery receipt",
  );

  const retry = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
  const retryBody = await retry.json();
  assert.equal(retry.status, 200);
  assert.deepEqual(retryBody.newlyPassedQuestIds, []);

  const account = state.user("current").publicMetadata;
  assert.deepEqual((account.challengeProgress as { completedChallengeIds: string[] }).completedChallengeIds, ["old", "new"]);
  assert.equal((account.concurrentProfileField as { survives: boolean }).survives, true);
  const attempts = account.challengeAttempts as Array<Record<string, unknown>>;
  assert.equal(attempts.length, 1);
  assert.deepEqual(attempts[0], {
    id: attempts[0].id,
    challengeId: "new",
    gameId: "original-game",
    provider: "chess.com",
    status: "passed",
    summary: "Multiplayer proof verified: Original game passed",
    checkedAt: attempts[0].checkedAt,
    completedGameAt: "2026-07-03T04:05:06.000Z",
    finalPositionFen: "8/8/8/8/8/8/8/K6k b - - 7 42",
    lastMoveUci: "a2a1",
    lastMoveSan: "Ka1",
  });

  const reconciledQuest = getStoredGroupQuests(state.user("host").privateMetadata)[0];
  const reconciledParticipant = reconciledQuest.participants.find((entry) => entry.userId === "current")! as typeof baseQuest.participants[number] & {
    pendingCompletions?: unknown[];
  };
  assert.deepEqual(reconciledParticipant.pendingCompletions ?? [], []);
  const writesBeforeNoop = state.writes.length;
  const noop = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
  assert.equal(noop.status, 400, "finished quests close again after their pending receipt is acknowledged");
  assert.equal(state.writes.length, writesBeforeNoop, "a reconciled retry must not write another receipt or group snapshot");
  assert.equal((state.user("current").publicMetadata.challengeAttempts as unknown[]).length, 1);
});

test(`${variant} hosted loader rejects a stored receipt for a different participant provider without writing`, async () => {
  const state = statefulHostedClient();
  const quest = structuredClone(baseQuest);
  const participant = quest.participants.find((entry) => entry.userId === "current")!;
  acceptReceipt(participant);
  participant.provider = "lichess";
  state.setHostPrivateMetadata({ sqcGroupQuests: [quest] });
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => {
      const stored = getStoredGroupQuests(state.user("host").privateMetadata)[0];
      return { userId: "host", groupQuest: stored };
    },
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user("current").publicMetadata.challengeAttempts, []);
});

test(`${variant} hosted loader rejects a stored receipt when its participant provider is unsupported without writing`, async () => {
  const state = statefulHostedClient();
  const quest = structuredClone(baseQuest);
  const participant = quest.participants.find((entry) => entry.userId === "current")!;
  participant.provider = "lichess";
  acceptReceipt(participant);
  (participant as unknown as { provider: string }).provider = "unsupported";
  state.setHostPrivateMetadata({ sqcGroupQuests: [quest] });
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => {
      const stored = getStoredGroupQuests(state.user("host").privateMetadata)[0];
      return { userId: "host", groupQuest: stored };
    },
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user("current").publicMetadata.challengeAttempts, []);
});
}

for (const variant of ["web", "mobile"] as const) {
test(`${variant} official capacity retry acknowledges persisted receipts without duplicate storage`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const initial = statefulOfficialClient(groupQuestId).user();
  const quest = getStoredOfficialGroupQuestParticipations(initial.publicMetadata, "current")[0];
  const pending = buildPendingGroupQuestCompletions({
    groupQuestId,
    provider: "chesscom",
    existing: [],
    newlyPassedQuestIds: quest.questIds,
    checks: quest.questIds.map((questId) => ({
      questId,
      result: { status: "passed" as const, gameId: `original-${questId}`, summary: "勝利🏆".repeat(20), gameTime: "2099-07-02T04:05:06.000Z" },
    })),
    checkedAt: "2099-07-02T05:06:07.000Z",
  });
  const completedQuest = updateParticipantProgress(quest, "current", {
    completedQuestIds: quest.questIds,
    score: 300,
    questFinishedAt: Object.fromEntries(quest.questIds.map((id) => [id, "2099-07-02T04:05:06.000Z"])),
    pendingCompletions: pending,
  });
  const receiptPatch = { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation(initial.publicMetadata, completedQuest, "current") };
  let metadata = deepMerge(initial.publicMetadata, receiptPatch);
  const accountPatch = buildMultiplayerCompletionAccountPatch(metadata, pending);
  const acknowledgedPatch = {
    ...accountPatch,
    [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation(
      deepMerge(metadata, accountPatch),
      updateParticipantProgress(completedQuest, "current", { pendingCompletions: [] }),
      "current",
    ),
  };
  const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value), "utf8");
  const limit = 7680;
  const padding = limit - Math.max(bytes({ ...metadata, padding: "" }), bytes({ ...deepMerge(metadata, acknowledgedPatch), padding: "" }));
  assert.ok(padding > 0);
  metadata = JSON.parse(JSON.stringify({ ...metadata, padding: "界".repeat(Math.floor(padding / 3)) }));
  assert.ok(bytes(metadata) <= limit);
  assert.ok(bytes(deepMerge(metadata, acknowledgedPatch)) <= limit);
  assert.ok(bytes(deepMerge(metadata, accountPatch)) > limit, "receipt plus account duplication exceeds the byte budget");
  assert.ok(JSON.stringify(deepMerge(metadata, accountPatch)).length < limit, "character counts miss multibyte overflow");
  const writes: Record<string, unknown>[] = [];
  const client = { users: {
    getUser: async () => ({ ...initial, publicMetadata: structuredClone(metadata) }),
    updateUserMetadata: async (_userId: string, patch: { publicMetadata: Record<string, unknown> }) => {
      const projected = deepMerge(metadata, patch.publicMetadata);
      if (bytes(projected) > limit) throw new Error("fake_clerk_public_metadata_capacity");
      metadata = JSON.parse(JSON.stringify(projected));
      writes.push(structuredClone(patch.publicMetadata));
    },
  } };
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(metadata, "current")[0] }),
    check: async () => mismatch,
  };
  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).newlyPassedQuestIds, []);
  assert.deepEqual(getStoredOfficialGroupQuestParticipations(metadata, "current")[0].participants[0].pendingCompletions ?? [], []);
  assert.deepEqual(metadata.challengeAttempts, JSON.parse(JSON.stringify(accountPatch.challengeAttempts)));
  assert.deepEqual(metadata.challengeProgress, accountPatch.challengeProgress);
  assert.deepEqual(metadata.concurrentProfileField, { survives: true });
  assert.equal(writes.length, 1, "reconciliation uses one account projection plus receipt acknowledgement write");
  assert.equal("challengeProgress" in writes[0] && OFFICIAL_GROUP_QUEST_METADATA_KEY in writes[0], true);
});

test(`${variant} reconciles an existing official receipt before checking fresh proof`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const initial = state.user();
  const quest = getStoredOfficialGroupQuestParticipations(initial.publicMetadata, "current")[0];
  const challengeId = quest.questIds[0];
  const pending = buildPendingGroupQuestCompletions({
    groupQuestId,
    provider: "chesscom",
    existing: [],
    newlyPassedQuestIds: [challengeId],
    checks: [{
      questId: challengeId,
      result: { status: "passed", gameId: "accepted-game", summary: "Accepted proof", gameTime: "2099-07-02T04:05:06.000Z" },
    }],
    checkedAt: "2099-07-02T05:06:07.000Z",
  });
  const withReceipt = updateParticipantProgress(quest, "current", {
    completedQuestIds: [challengeId],
    score: 100,
    questFinishedAt: { [challengeId]: "2099-07-02T04:05:06.000Z" },
    pendingCompletions: pending,
  });
  state.setPublicMetadata(deepMerge(initial.publicMetadata, {
    [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation(initial.publicMetadata, withReceipt, "current"),
  }));
  let checkCalls = 0;
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => {
      checkCalls += 1;
      throw new Error("fresh proof must not block durable reconciliation");
    },
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(checkCalls, 0);
  assert.equal((state.user().publicMetadata.challengeAttempts as unknown[]).length, 1);
  assert.deepEqual(getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0].participants[0].pendingCompletions ?? [], []);
});

test(`${variant} rejects an unsupported provider in a stored official receipt without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  const receipt = acceptReceipt(record, groupQuestId, challengeId);
  (receipt as { provider: string }).provider = "unsupported";
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt when its participant provider is unsupported without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  record.provider = "lichess";
  acceptReceipt(record, groupQuestId, challengeId);
  record.provider = "unsupported";
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt whose identity is not canonical without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  const receipt = acceptReceipt(record, groupQuestId, challengeId);
  receipt.id = "forged-receipt-id";
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt whose timestamp is not canonical without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  const receipt = acceptReceipt(record, groupQuestId, challengeId);
  receipt.checkedAt = "tomorrow";
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt whose game time contradicts accepted progress without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  const receipt = acceptReceipt(record, groupQuestId, challengeId);
  receipt.completedGameAt = "2099-07-02T04:05:07.000Z";
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt for a different participant provider without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  acceptReceipt(record, groupQuestId, challengeId);
  record.provider = "lichess";
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt for a challenge absent from accepted progress without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  acceptReceipt(record, groupQuestId, challengeId);
  record.completedQuestIds = [];
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

test(`${variant} rejects a stored official receipt without an accepted completion timestamp without writing`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId, false);
  const metadata = state.user().publicMetadata;
  const record = (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[groupQuestId];
  const challengeId = getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0];
  acceptReceipt(record, groupQuestId, challengeId);
  record.questFinishedAt = {};
  state.setPublicMetadata(metadata);
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0] }),
    check: async () => mismatch,
  };

  const response = await (variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(response.status, 200);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(state.user().publicMetadata.challengeAttempts, []);
});

for (const paddingLocation of ["root", "official record"] as const) {
test(`${variant} official capacity preflight rejects new progress before persisting a receipt (${paddingLocation})`, async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const initial = statefulOfficialClient(groupQuestId).user();
  const quest = getStoredOfficialGroupQuestParticipations(initial.publicMetadata, "current")[0];
  const checkedAt = new Date().toISOString();
  const result = { status: "passed" as const, gameId: "original-game", summary: "勝利🏆", gameTime: "2026-07-02T04:05:06.000Z" };
  const pending = buildPendingGroupQuestCompletions({
    groupQuestId, provider: "chesscom", existing: [], newlyPassedQuestIds: quest.questIds,
    checks: quest.questIds.map((questId) => ({ questId, result })), checkedAt,
  });
  const completedQuest = updateParticipantProgress(quest, "current", {
    completedQuestIds: quest.questIds, score: 300, pendingCompletions: pending,
    questFinishedAt: Object.fromEntries(quest.questIds.map((id) => [id, result.gameTime])),
    lastProofSummary: result.summary, lastProofAt: checkedAt,
  });
  const receiptPatch = { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation(initial.publicMetadata, completedQuest, "current") };
  const accountPatch = buildMultiplayerCompletionAccountPatch(initial.publicMetadata, pending);
  const acknowledgedPatch = {
    ...accountPatch,
    [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation(
      deepMerge(initial.publicMetadata, accountPatch),
      updateParticipantProgress(completedQuest, "current", { pendingCompletions: [] }), "current",
    ),
  };
  const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value), "utf8");
  const limit = 7680;
  const paddedMetadata = (padding: string) => deepMerge(initial.publicMetadata, paddingLocation === "root"
    ? { padding }
    : { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: { [groupQuestId]: { padding } } });
  const padding = limit - bytes(deepMerge(paddedMetadata(""), receiptPatch));
  let metadata = paddedMetadata("界".repeat(Math.floor(padding / 3)));
  assert.ok(bytes(deepMerge(metadata, receiptPatch)) <= limit, "durable receipt alone fits");
  assert.ok(bytes(deepMerge(metadata, acknowledgedPatch)) > limit, "acknowledged account projection cannot fit");
  const before = structuredClone(metadata);
  let writes = 0;
  const client = { users: {
    getUser: async () => ({ ...initial, publicMetadata: structuredClone(metadata) }),
    updateUserMetadata: async (_userId: string, patch: { publicMetadata: Record<string, unknown> }) => {
      writes += 1;
      const projected = deepMerge(metadata, patch.publicMetadata);
      if (bytes(projected) > limit) throw new Error("fake_clerk_public_metadata_capacity");
      metadata = JSON.parse(JSON.stringify(projected));
    },
  } };
  const dependencies = {
    authenticate: async () => "current", getClient: async () => client,
    findQuest: async () => ({ userId: "official-sqc", groupQuest: getStoredOfficialGroupQuestParticipations(metadata, "current")[0] }),
    check: async () => result,
  };
  await assert.rejects(variant === "web"
    ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }))
    : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })));
  assert.equal(writes, 0, "capacity must be checked before accepting group progress");
  assert.deepEqual(metadata, before);
});
}
}

test("web official completion survives an account-write failure as a serialized pending receipt", async () => {
  const groupQuestId = "official-starter-shield-2099-07-01";
  const state = statefulOfficialClient(groupQuestId);
  let acceptingOriginalGame = true;
  const dependencies = {
    authenticate: async () => "current",
    getClient: async () => state.client,
    findQuest: async () => {
      const quest = getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")
        .find((entry) => entry.id === groupQuestId);
      return quest ? { userId: "official-sqc", groupQuest: quest } : null;
    },
    check: async ({ challengeId }: { challengeId: string }) => acceptingOriginalGame
      ? {
          status: "passed" as const,
          gameId: `original-${challengeId}`,
          summary: `${challengeId} originally passed`,
          gameTime: "2026-07-02T04:05:06.000Z",
        }
      : { ...mismatch, status: "pending" as const, gameId: `newer-${challengeId}` },
  };

  await assert.rejects(
    webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) })),
    /injected account completion failure/,
  );
  acceptingOriginalGame = false;

  const failedQuest = getStoredOfficialGroupQuestParticipations(state.user().publicMetadata, "current")[0];
  assert.equal(failedQuest.participants[0].pendingCompletions?.length, failedQuest.questIds.length);
  assert.equal(failedQuest.participants[0].pendingCompletions?.[0].gameId.startsWith("original-"), true);

  const retry = await webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(groupQuestId), { params: Promise.resolve({ id: groupQuestId }) }));
  assert.equal(retry.status, 200);
  assert.deepEqual((await retry.json()).newlyPassedQuestIds, []);
  const account = state.user().publicMetadata;
  const attempts = account.challengeAttempts as Array<{ id: string; gameId: string }>;
  assert.equal(attempts.length, failedQuest.questIds.length);
  assert.equal(attempts.every((attempt) => attempt.gameId.startsWith("original-") && attempt.id.includes(groupQuestId)), true);
  assert.deepEqual(getStoredOfficialGroupQuestParticipations(account, "current")[0].participants[0].pendingCompletions ?? [], []);
});

for (const variant of ["web", "mobile"] as const) {
  test(`${variant} official refresh writes compact group progress to public metadata`, async () => {
    const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];
    const client = fakeClient(writes);
    const officialQuest = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
    officialQuest.endAt = "2099-07-19T00:00:00.000Z";
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
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(officialQuest.id), { params: Promise.resolve({ id: officialQuest.id }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(officialQuest.id), { params: Promise.resolve({ id: officialQuest.id }) })));

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

for (const variant of ["web", "mobile"] as const) for (const official of [false, true]) {
  for (const [label, value] of Object.entries({
    absent: undefined, canonical: "2099-07-02T04:05:06.000Z", null: null, number: 42,
    "leading whitespace": " 2099-07-02T04:05:06.000Z", "trailing whitespace": "2099-07-02T04:05:06.000Z ",
    overlong: "2099-07-02T04:05:06.000Z" + " ".repeat(41), "noncanonical ISO": "2099-07-02T04:05:06Z",
  })) test(`${variant} ${official ? "official" : "hosted"} stored completedGameAt: ${label}`, async () => {
    const id = official ? "official-starter-shield-2099-07-01" : "gq";
    const hosted = statefulHostedClient(false);
    const officialState = statefulOfficialClient(id, false);
    const metadata = officialState.user().publicMetadata;
    const quest = getStoredGroupQuests(hosted.user("host").privateMetadata)[0];
    const record = official
      ? (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[id]
      : quest.participants[1];
    const challengeId = official ? getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0] : "new";
    const receipt = acceptReceipt(record, id, challengeId);
    if (label === "absent") delete (receipt as { completedGameAt?: string }).completedGameAt;
    else (receipt as Record<string, unknown>).completedGameAt = value;
    officialState.setPublicMetadata(metadata);
    hosted.setHostPrivateMetadata({ sqcGroupQuests: [quest] });
    const load = () => official ? getStoredOfficialGroupQuestParticipations(officialState.user().publicMetadata, "current")[0]
      : getStoredGroupQuests(hosted.user("host").privateMetadata)[0];
    const valid = label === "absent" || label === "canonical";
    assert.equal(load().participants.find((entry) => entry.userId === "current")!.pendingCompletions?.length ?? 0, valid ? 1 : 0);
    const dependencies = {
      authenticate: async () => "current", getClient: async () => official ? officialState.client : hosted.client,
      findQuest: async () => ({ userId: official ? "official-sqc" : "host", groupQuest: load() }), check: async () => mismatch,
    };
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(id), { params: Promise.resolve({ id }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(id), { params: Promise.resolve({ id }) })));
    assert.equal(response.status, 200);
    if (!valid) assert.equal((official ? officialState : hosted).writes.length, 0);
    const account = official ? officialState.user().publicMetadata : hosted.user("current").publicMetadata;
    assert.equal((account.challengeAttempts as unknown[]).length, valid ? 1 : 0);
  });
}

test("all refresh adapters reject completion timestamps after the receipt check before any write", async () => {
  for (const variant of ["web", "mobile"] as const) for (const official of [false, true]) for (const receiptHasGameTime of [true, false]) {
    const id = official ? "official-starter-shield-2099-07-01" : "gq";
    const hosted = statefulHostedClient(false);
    const officialState = statefulOfficialClient(id, false);
    const metadata = officialState.user().publicMetadata;
    const quest = getStoredGroupQuests(hosted.user("host").privateMetadata)[0];
    const record = official
      ? (metadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[id]
      : quest.participants[1];
    const challengeId = official ? getStoredOfficialGroupQuestParticipations(metadata, "current")[0].questIds[0] : "new";
    const receipt = acceptReceipt(record, id, challengeId);
    const futureCompletion = "2099-07-03T04:05:06.000Z";
    record.questFinishedAt = { [challengeId]: futureCompletion };
    if (receiptHasGameTime) receipt.completedGameAt = futureCompletion;
    else delete (receipt as { completedGameAt?: string }).completedGameAt;
    officialState.setPublicMetadata(metadata);
    hosted.setHostPrivateMetadata({ sqcGroupQuests: [quest] });
    const load = () => official ? getStoredOfficialGroupQuestParticipations(officialState.user().publicMetadata, "current")[0]
      : getStoredGroupQuests(hosted.user("host").privateMetadata)[0];
    assert.equal(load().participants.find((entry) => entry.userId === "current")!.pendingCompletions?.length ?? 0, 0);
    const dependencies = {
      authenticate: async () => "current", getClient: async () => official ? officialState.client : hosted.client,
      findQuest: async () => ({ userId: official ? "official-sqc" : "host", groupQuest: load() }), check: async () => mismatch,
    };
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(id), { params: Promise.resolve({ id }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(id), { params: Promise.resolve({ id }) })));
    assert.equal(response.status, 200);
    assert.equal((official ? officialState : hosted).writes.length, 0, `${variant} official=${official} receiptHasGameTime=${receiptHasGameTime}`);
    const account = official ? officialState.user().publicMetadata : hosted.user("current").publicMetadata;
    assert.equal((account.challengeAttempts as unknown[]).length, 0);
  }
});

test("all refresh adapters reject duplicate or conflicting receipt IDs before any write", async () => {
  for (const variant of ["web", "mobile"] as const) for (const official of [false, true]) {
    for (const conflicting of [false, true]) for (const stored of [false, true]) {
      const id = official ? "official-starter-shield-2099-07-01" : "gq";
      const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];
      const client = fakeClient(writes);
      const quest = official ? getBuiltInOfficialGroupQuests(new Date("2099-07-02T12:00:00.000Z"))[0]
        : getStoredGroupQuests({ sqcGroupQuests: [structuredClone(baseQuest)] })[0];
      quest.id = id;
      quest.participants = [getStoredGroupQuests({ sqcGroupQuests: [structuredClone(baseQuest)] })[0].participants[1]];
      const receipt = acceptReceipt(quest.participants[0], id, quest.questIds[0]);
      quest.participants[0].pendingCompletions = [receipt, { ...receipt, ...(conflicting ? { summary: "Conflicting proof" } : {}) }];
      const loaded = !stored ? quest : official
        ? getStoredOfficialGroupQuestParticipations({ [OFFICIAL_GROUP_QUEST_METADATA_KEY]: { [id]: { ...quest.participants[0], active: true } } }, "current")[0]
        : getStoredGroupQuests({ sqcGroupQuests: [quest] })[0];
      const dependencies = {
        authenticate: async () => "current", getClient: async () => client,
        findQuest: async () => ({ userId: official ? "official-sqc" : "host", groupQuest: loaded }),
        check: async () => mismatch,
      };
      const run = () => variant === "web"
        ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(id), { params: Promise.resolve({ id }) }))
        : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(id), { params: Promise.resolve({ id }) }));
      if (stored) assert.equal((await run()).status, 200);
      else await assert.rejects(run(), /groupquest_completion_receipt_invalid/);
      assert.equal(writes.length, 0, `${variant} official=${official} conflicting=${conflicting} stored=${stored}`);
    }
  }
});

test("hosted receipts from a previously removed lineup remain recoverable through refresh", async () => {
  for (const variant of ["web", "mobile"] as const) {
    const state = statefulHostedClient(false);
    const quest = structuredClone(baseQuest);
    acceptReceipt(quest.participants[1]);
    quest.questIds = ["old"];
    state.setHostPrivateMetadata({ sqcGroupQuests: [quest] });
    const load = () => getStoredGroupQuests(state.user("host").privateMetadata)[0];
    assert.equal(load().participants[1].pendingCompletions?.length, 1);
    const dependencies = {
      authenticate: async () => "current", getClient: async () => state.client,
      findQuest: async () => ({ userId: "host", groupQuest: load() }),
      check: async () => { throw new Error("receipt recovery must not request fresh proof"); },
    };
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
    assert.equal(response.status, 200);
    assert.equal((state.user("current").publicMetadata.challengeAttempts as unknown[]).length, 1);
    assert.deepEqual(load().participants[1].pendingCompletions, []);
    assert.deepEqual(load().participants[1].completedQuestIds, ["new"]);
    assert.equal(load().participants[1].questFinishedAt?.new, acceptedReceipt().completedGameAt);
  }
});

test("hosted history survives lineup removal, storage, and restoration without rescoring", async () => {
  for (const variant of ["web", "mobile"] as const) {
    const state = statefulHostedClient();
    const quest = getStoredGroupQuests({ sqcGroupQuests: [structuredClone(baseQuest)] })[0];
    const completed = ["old", ...Array.from({ length: 8 }, (_, index) => `historical-${index}`)];
    const times = Object.fromEntries(completed.map((id) => [id, "2026-07-02T00:00:00.000Z"]));
    Object.assign(quest.participants[1], { completedQuestIds: completed, questFinishedAt: times });
    quest.questIds = ["new"];
    const removed = { sqcGroupQuests: groupquests.upsertHostGroupQuest({}, quest) };
    const loaded = getStoredGroupQuests(JSON.parse(JSON.stringify(removed)))[0];
    assert.deepEqual(loaded.participants[1].completedQuestIds, completed);
    assert.deepEqual(loaded.participants[1].questFinishedAt, times);
    loaded.questIds = ["old"];
    state.setHostPrivateMetadata({ sqcGroupQuests: groupquests.upsertHostGroupQuest(removed, loaded) });
    const dependencies = {
      authenticate: async () => "current", getClient: async () => state.client,
      findQuest: async () => ({ userId: "host", groupQuest: getStoredGroupQuests(state.user("host").privateMetadata)[0] }),
      check: async () => ({ status: "passed" as const, gameId: "different-game", summary: "Passed again", gameTime: "2026-07-03T00:00:00.000Z" }),
    };
    const response = await (variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) })));
    const body = await response.json();
    assert.deepEqual(body.newlyPassedQuestIds, []);
    assert.equal(body.score, 100);
    assert.equal(state.writes.length, 0);
    assert.deepEqual(getStoredGroupQuests(state.user("host").privateMetadata)[0].participants[1].questFinishedAt, times);
  }
});

test("exported hosted update routes cannot remove a lineup challenge with an outstanding receipt", async () => {
  for (const variant of ["mobile", "web"] as const) {
    const state = statefulHostedClient(false);
    const quest = structuredClone(baseQuest);
    quest.questIds = ["finish-any-game", "knights-before-coffee"];
    acceptReceipt(quest.participants[1], "gq", "finish-any-game");
    state.setHostPrivateMetadata({ sqcGroupQuests: [quest] });
    const before = state.user("host").privateMetadata;
    const findQuest = async () => ({ userId: "host", groupQuest: getStoredGroupQuests(state.user("host").privateMetadata)[0] });
    assert.equal((await findQuest()).groupQuest.participants[1].pendingCompletions?.length, 1);
    const update = (questIds: string[]) => {
      const req = new Request("https://sqc.test/api/groupquests/gq", {
        method: variant === "web" ? "PATCH" : "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "update", questIds }),
      });
      return variant === "web"
        ? webUpdateRoute({ client: state.client, findQuest }).PATCH(req, { params: Promise.resolve({ id: "gq" }) })
        : mobileRoute.withMobileRefreshRouteTestDependencies({ authenticate: async () => "host", getClient: async () => state.client, findQuest, check: async () => mismatch } as never,
          () => mobileRoute.POST(req, { params: Promise.resolve({ id: "gq" }) }));
    };
    // Web propagates the storage guard as a server error; mobile uses its existing save error response.
    if (variant === "web") await assert.rejects(update(["knights-before-coffee"]), /groupquest_pending_completion_lineup/);
    else assert.equal((await update(["knights-before-coffee"])).status, 500);
    assert.equal(state.writes.length, 0, variant);
    assert.deepEqual(state.user("host").privateMetadata, before);
    assert.equal((await update(["knights-before-coffee", "finish-any-game"])).status, 200, "retaining pending challenges is allowed");
    const dependencies = {
      authenticate: async () => "current", getClient: async () => state.client, findQuest,
      check: async () => mismatch,
    };
    const refresh = () => variant === "web"
      ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }))
      : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request(), { params: Promise.resolve({ id: "gq" }) }));
    assert.equal((await refresh()).status, 200, "the protected receipt remains recoverable");
    assert.equal((state.user("current").publicMetadata.challengeAttempts as unknown[]).length, 1);
    assert.equal((await update(["knights-before-coffee"])).status, 200, "acknowledged challenges can be removed");
    assert.equal((await update(["finish-any-game"])).status, 200);
    dependencies.check = async () => ({ status: "passed", gameId: "later-game", summary: "Passed again", gameTime: "2099-07-03T00:00:00.000Z" } as never);
    const writesBeforeRetry = state.writes.length;
    const retry = await (await refresh()).json();
    assert.deepEqual(retry.newlyPassedQuestIds, []);
    assert.equal(retry.score, 100);
    assert.equal(state.writes.length, writesBeforeRetry);
    assert.equal((await findQuest()).groupQuest.participants[1].questFinishedAt?.["finish-any-game"], acceptedReceipt().completedGameAt);
  }
});

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
