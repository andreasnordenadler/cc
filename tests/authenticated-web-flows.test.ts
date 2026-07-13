import assert from "node:assert/strict";
import test from "node:test";

import { handleCommunityLikeRequest, type CommunityLikeDependencies } from "../src/lib/community-like-route";
import { handleGroupQuestCreateRequest, type GroupQuestCreateDependencies } from "../src/lib/groupquest-create-route";
import { handleGroupQuestJoinRequest, type GroupQuestJoinDependencies } from "../src/lib/groupquest-join-route";
import { handleCustomQuestCreateRequest, type CustomQuestCreateDependencies } from "../src/lib/custom-quest-create-route";
import { buildActiveMultiplayerHomeRows } from "../src/lib/mobile-web-home";
import type { ServerGroupQuest } from "../src/lib/groupquests";

const jsonPost = (url: string, body: unknown) => new Request(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

async function body(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function likeDependencies(overrides: Partial<CommunityLikeDependencies> = {}): CommunityLikeDependencies {
  return {
    getAuthenticatedUserId: async () => "viewer-1",
    getPrivateMetadata: async () => ({ preserved: "yes" }),
    savePrivateMetadata: async () => undefined,
    revalidatePath: () => undefined,
    ...overrides,
  };
}

test("community like handler parses JSON, derives identity from auth, and writes exact metadata", async () => {
  const writes: unknown[] = [];
  const revalidated: string[] = [];
  const response = await handleCommunityLikeRequest(
    jsonPost("https://sqc.test/api/community-likes", { targetType: "solo", targetId: "quest & one", intent: "like", userId: "attacker", returnTo: "https://evil.test" }),
    likeDependencies({
      savePrivateMetadata: async (userId, metadata) => { writes.push({ userId, metadata }); },
      revalidatePath: (path) => { revalidated.push(path); },
      now: () => new Date("2026-07-12T10:00:00.000Z"),
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await body(response), { ok: true, targetType: "solo", targetId: "quest & one", liked: true, countUnknownUntilRefresh: true });
  assert.deepEqual(writes, [{ userId: "viewer-1", metadata: { preserved: "yes", sqcCommunityLikes: [{ targetType: "solo", targetId: "quest & one", likedAt: "2026-07-12T10:00:00.000Z" }] } }]);
  assert.deepEqual(revalidated, ["/challenges/community", "/challenges/community/quest%20%26%20one", "/challenges", "/challenges/quest%20%26%20one", "/groupquests/public", "/groupquests/quest%20%26%20one"]);
});

test("community like handler performs no reads or writes after auth or validation failure", async () => {
  let calls = 0;
  const deps = likeDependencies({ getAuthenticatedUserId: async () => null, getPrivateMetadata: async () => { calls += 1; return {}; }, savePrivateMetadata: async () => { calls += 1; } });
  const unauthenticated = await handleCommunityLikeRequest(jsonPost("https://sqc.test/api/community-likes", { targetType: "solo", targetId: "quest" }), deps);
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await body(unauthenticated), { ok: false, error: "sign_in_required" });
  const invalid = await handleCommunityLikeRequest(jsonPost("https://sqc.test/api/community-likes", { targetType: "bad", targetId: "" }), likeDependencies({ getPrivateMetadata: async () => { calls += 1; return {}; }, savePrivateMetadata: async () => { calls += 1; } }));
  assert.equal(invalid.status, 400);
  assert.equal(calls, 0);
});

test("community like handler returns a safe response when persistence fails", async () => {
  const response = await handleCommunityLikeRequest(jsonPost("https://sqc.test/api/community-likes", { targetType: "multiplayer", targetId: "g1" }), likeDependencies({ savePrivateMetadata: async () => { throw new Error("Clerk secret details"); } }));
  assert.equal(response.status, 503);
  assert.deepEqual(await body(response), { ok: false, error: "like_update_failed" });
});

const user = {
  id: "host-1",
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada",
  primaryEmailAddress: { emailAddress: "ada@example.test" },
  publicMetadata: { lichessUsername: "AdaLichess" },
  privateMetadata: { preserved: "yes" },
};

function createDependencies(overrides: Partial<GroupQuestCreateDependencies> = {}): GroupQuestCreateDependencies {
  return {
    getAuthenticatedUserId: async () => "host-1",
    getUser: async () => user,
    findPublicCustomQuestById: async () => null,
    savePrivateMetadata: async () => undefined,
    now: () => new Date("2026-07-12T12:00:00.000Z"),
    makeId: () => "ada-table-fixed",
    ...overrides,
  };
}

test("group quest create handler derives host identity and persists the exact production record", async () => {
  const writes: unknown[] = [];
  const response = await handleGroupQuestCreateRequest(jsonPost("https://sqc.test/api/groupquests", {
    hostUserId: "attacker",
    name: "Ada table",
    questIds: ["finish-any-game"],
    providerMode: "lichess",
    inviteMode: "private-key",
    inviteKey: "ADA-KEY",
    openImmediately: true,
    endAt: "2026-07-20T12:00:00.000Z",
  }), createDependencies({ savePrivateMetadata: async (id, metadata) => { writes.push({ id, metadata }); } }));

  assert.equal(response.status, 200);
  assert.deepEqual(await body(response), { ok: true, id: "ada-table-fixed", href: "/groupquests/ada-table-fixed?accepted=1" });
  const write = writes[0] as { id: string; metadata: Record<string, unknown> };
  assert.equal(write.id, "host-1");
  assert.equal(write.metadata.preserved, "yes");
  const saved = (write.metadata.sqcGroupQuests as ServerGroupQuest[])[0];
  assert.deepEqual(saved, {
    id: "ada-table-fixed", hostUserId: "host-1", hostName: "Ada Lovelace", name: "Ada table",
    inviteMode: "private-key", inviteKey: "ada-key", questIds: ["finish-any-game"], providerMode: "lichess", providerLabel: "Lichess only",
    startAt: "2026-07-12T12:00:00.000Z", endAt: "2026-07-20T12:00:00.000Z",
    rules: { result: "Win required", timeControl: "Any time control", rated: "Any rated state", color: "Any color" },
    createdAt: "2026-07-12T12:00:00.000Z",
    participants: [{ userId: "host-1", provider: "lichess", username: "AdaLichess", leaderboardName: "Ada Lovelace", joinedAt: "2026-07-12T12:00:00.000Z" }],
  });
});

test("group quest create rejects malformed JSON and persistence failures without leaking details", async () => {
  let writes = 0;
  const malformed = await handleGroupQuestCreateRequest(jsonPost("https://sqc.test/api/groupquests", "{"), createDependencies({ savePrivateMetadata: async () => { writes += 1; } }));
  assert.equal(malformed.status, 400);
  assert.deepEqual(await body(malformed), { ok: false, error: "invalid_payload" });
  assert.equal(writes, 0);
  const failed = await handleGroupQuestCreateRequest(jsonPost("https://sqc.test/api/groupquests", { name: "Table", questIds: ["finish-any-game"] }), createDependencies({ savePrivateMetadata: async () => { throw new Error("private database text"); } }));
  assert.equal(failed.status, 503);
  assert.deepEqual(await body(failed), { ok: false, error: "groupquest_save_failed" });
});

function joinQuest(): ServerGroupQuest {
  return { id: "exact-id", hostUserId: "host-2", hostName: "Host", name: "Private", inviteCopy: "Join", inviteMode: "private-key", inviteKey: "SECRET", questIds: ["finish-any-game"], providerMode: "lichess", providerLabel: "Lichess", startAt: "2026-07-01T00:00:00.000Z", endAt: "2099-07-20T00:00:00.000Z", rules: {}, createdAt: "2026-07-01T00:00:00.000Z", participants: [] };
}

function joinDependencies(overrides: Partial<GroupQuestJoinDependencies> = {}): GroupQuestJoinDependencies {
  return {
    getAuthenticatedUserId: async () => "joiner-1",
    findQuestById: async () => ({ userId: "host-2", groupQuest: joinQuest() }),
    getUser: async () => ({ id: "joiner-1", firstName: "Grace", lastName: "Hopper", publicMetadata: { lichessUsername: "AmazingGrace" } }),
    saveJoinedQuest: async () => undefined,
    ...overrides,
  };
}

test("exact join handler ignores spoofed identity and saves only the route quest", async () => {
  const lookups: string[] = [];
  let saved: Parameters<GroupQuestJoinDependencies["saveJoinedQuest"]>[0] | undefined;
  const response = await handleGroupQuestJoinRequest(jsonPost("https://sqc.test/api/groupquests/exact-id/join", { inviteKey: "secret", userId: "victim", username: "spoof" }), "exact-id", joinDependencies({ findQuestById: async (id) => { lookups.push(id); return { userId: "host-2", groupQuest: joinQuest() }; }, saveJoinedQuest: async (input) => { saved = input; } }));
  assert.equal(response.status, 200);
  assert.deepEqual(lookups, ["exact-id"]);
  assert.equal(saved?.authenticatedUserId, "joiner-1");
  assert.equal(saved?.joinedQuest.participants[0]?.username, "AmazingGrace");
  assert.equal(saved?.joinedQuest.participants[0]?.leaderboardName, "Grace Hopper");
});

test("exact join handler performs no write for bad invite key and safely handles save failure", async () => {
  let writes = 0;
  const forbidden = await handleGroupQuestJoinRequest(jsonPost("https://sqc.test/api/groupquests/exact-id/join", { inviteKey: "wrong" }), "exact-id", joinDependencies({ saveJoinedQuest: async () => { writes += 1; } }));
  assert.equal(forbidden.status, 403);
  assert.equal(writes, 0);
  const failed = await handleGroupQuestJoinRequest(jsonPost("https://sqc.test/api/groupquests/exact-id/join", { inviteKey: "secret" }), "exact-id", joinDependencies({ saveJoinedQuest: async () => { throw new Error("host metadata leaked"); } }));
  assert.equal(failed.status, 503);
  assert.deepEqual(await body(failed), { ok: false, error: "join_unavailable" });
});

function customDependencies(overrides: Partial<CustomQuestCreateDependencies> = {}): CustomQuestCreateDependencies {
  return {
    getAuthenticatedUserId: async () => "creator-1",
    getMetadata: async () => ({ publicMetadata: {}, privateMetadata: { preserved: true } }),
    saveCustomQuests: async (_id, quests) => quests,
    now: () => new Date("2026-07-12T14:00:00.000Z"),
    makeId: () => "custom-fixed",
    chooseBadge: () => "/badges/fixed.png",
    logPersistenceError: () => undefined,
    ...overrides,
  };
}

const validConfig = JSON.stringify({ version: 1, combinator: "all", blocks: [{ id: "b1", type: "gameResult", result: "win" }] });

test("custom quest create parses JSON, validates rules, and persists exact normalized quest", async () => {
  const writes: unknown[] = [];
  const response = await handleCustomQuestCreateRequest(jsonPost("https://sqc.test/api/mobile/custom-quests", { title: "  Win   nicely ", summary: " A   useful quest ", config: validConfig, visibility: "public", userId: "attacker" }), customDependencies({ saveCustomQuests: async (id, quests, privateMetadata) => { writes.push({ id, quests, privateMetadata }); return quests; } }));
  assert.equal(response.status, 200);
  const payload = await body(response);
  assert.equal(payload.ok, true);
  assert.deepEqual(writes, [{ id: "creator-1", quests: [{ id: "custom-fixed", title: "Win nicely", summary: "A useful quest", config: '{"version":1,"logic":"all","blocks":[{"id":"b1","type":"gameResult","result":"win"}]}', visibility: "public", lifecycle: "published", createdAt: "2026-07-12T14:00:00.000Z", updatedAt: "2026-07-12T14:00:00.000Z", badgeImageUrl: "/badges/fixed.png" }], privateMetadata: { preserved: true } }]);
});

test("custom quest create makes no write on auth/validation failure", async () => {
  let writes = 0;
  const unauthenticated = await handleCustomQuestCreateRequest(jsonPost("https://sqc.test/api/mobile/custom-quests", { config: validConfig }), customDependencies({ getAuthenticatedUserId: async () => null, saveCustomQuests: async () => { writes += 1; return []; } }));
  assert.equal(unauthenticated.status, 401);
  const invalid = await handleCustomQuestCreateRequest(jsonPost("https://sqc.test/api/mobile/custom-quests", { config: "{}" }), customDependencies({ saveCustomQuests: async () => { writes += 1; return []; } }));
  assert.equal(invalid.status, 400);
  assert.equal(writes, 0);
});

test("custom quest create preserves the generic persistence error contract and sanitized log", async () => {
  const logs: unknown[] = [];
  const failed = await handleCustomQuestCreateRequest(jsonPost("https://sqc.test/api/mobile/custom-quests", { config: validConfig }), customDependencies({
    saveCustomQuests: async () => { throw new Error("Clerk secret sk_live_private_metadata"); },
    logPersistenceError: (...args) => { logs.push(args); },
  }));
  assert.equal(failed.status, 400);
  assert.deepEqual(await body(failed), { apiVersion: 1, authenticated: true, ok: false, message: "Could not save this custom Side Quest right now." });
  assert.deepEqual(logs, [["mobile custom Side Quest save failed", { reason: "persistence_error" }]]);
});

test("custom quest create preserves the metadata-capacity error contract and sanitized log", async () => {
  const logs: unknown[] = [];
  const failed = await handleCustomQuestCreateRequest(jsonPost("https://sqc.test/api/mobile/custom-quests", { config: validConfig }), customDependencies({
    saveCustomQuests: async () => { throw new Error("form_param_exceeds_allowed_size: secret private metadata"); },
    logPersistenceError: (...args) => { logs.push(args); },
  }));
  assert.equal(failed.status, 400);
  assert.deepEqual(await body(failed), { apiVersion: 1, authenticated: true, ok: false, message: "Your Side Quest library is full. SQC cleaned up older saved data; please try again." });
  assert.deepEqual(logs, [["mobile custom Side Quest save failed", { reason: "metadata_capacity" }]]);
});

test("production home view-model helper derives hosted and joined rows without mutating source records", () => {
  const hosted = { ...joinQuest(), id: "hosted", hostUserId: "viewer-1", inviteMode: "public" as const, participants: [] };
  const joined = { ...joinQuest(), id: "joined", inviteMode: "public" as const, participants: [{ userId: "viewer-1", provider: "lichess" as const, username: "viewer", leaderboardName: "Viewer", joinedAt: "2026-07-12T00:00:00.000Z" }] };
  const source = [joined, hosted];
  const rows = buildActiveMultiplayerHomeRows(source, "viewer-1");
  assert.deepEqual(rows.map(({ id, status, href }) => ({ id, status, href })), [{ id: "joined", status: "Joined", href: "/groupquests/joined?accepted=1" }, { id: "hosted", status: "Host", href: "/groupquests/hosted" }]);
  assert.equal(source[0], joined);
});
