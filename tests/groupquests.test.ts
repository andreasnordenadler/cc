import assert from "node:assert/strict";
import test from "node:test";

import { CLERK_USER_SCAN_MAX_PAGES, OFFICIAL_GROUP_QUEST_METADATA_KEY, buildGroupQuest, findGroupQuestById, findGroupQuestByInviteKey, getBuiltInOfficialGroupQuests, getGroupQuestParticipantFinishedAt, getGroupQuestResultMode, getStoredOfficialGroupQuestParticipations, listPublicGroupQuests, listUserRelatedGroupQuests, rankGroupQuestParticipants, upsertOfficialGroupQuestParticipation } from "../src/lib/groupquests";

type Participant = {
  id: string;
  userId: string;
  provider: "lichess";
  username: string;
  leaderboardName: string;
  score: number;
  completedQuestIds: string[];
  questFinishedAt: Record<string, string>;
  joinedAt: string;
};

function participant(id: string, overrides: Partial<Participant> = {}): Participant {
  return {
    id,
    userId: id,
    provider: "lichess",
    username: id,
    leaderboardName: id,
    score: 0,
    completedQuestIds: [],
    questFinishedAt: {},
    joinedAt: "2026-07-01T12:00:00.000Z",
    ...overrides,
  };
}

test("ranks incomplete players by completed quests from this multiplayer quest only", () => {
  const ranked = rankGroupQuestParticipants({
    questIds: ["rookless-rampage", "back-rank-goblin"],
    participants: [
      participant("unrelated", {
        completedQuestIds: ["old-quest-1", "old-quest-2", "old-quest-3"],
        joinedAt: "2026-07-01T11:00:00.000Z",
      }),
      participant("current", {
        completedQuestIds: ["rookless-rampage"],
        joinedAt: "2026-07-01T13:00:00.000Z",
      }),
    ],
  });

  assert.deepEqual(ranked.map(({ id }) => id), ["current", "unrelated"]);
});

test("ranks a player who completes every quest ahead of a higher-scoring incomplete player", () => {
  const finisher = participant("finisher", {
    score: 2,
    completedQuestIds: ["rookless-rampage", "back-rank-goblin"],
    questFinishedAt: {
      "rookless-rampage": "2026-07-02T10:00:00.000Z",
      "back-rank-goblin": "2026-07-02T11:00:00.000Z",
    },
  });
  const scorer = participant("scorer", { score: 99, completedQuestIds: ["rookless-rampage"] });
  const ranked = rankGroupQuestParticipants({
    questIds: ["rookless-rampage", "back-rank-goblin"],
    participants: [scorer, finisher],
  });
  assert.deepEqual(ranked.map(({ id }) => id), ["finisher", "scorer"]);
});

test("ranks multiple finishers by the timestamp of their final required quest", () => {
  const later = participant("later", {
    completedQuestIds: ["rookless-rampage", "back-rank-goblin"],
    questFinishedAt: {
      "rookless-rampage": "2026-07-02T09:00:00.000Z",
      "back-rank-goblin": "2026-07-02T12:00:00.000Z",
    },
  });
  const earlier = participant("earlier", {
    completedQuestIds: ["rookless-rampage", "back-rank-goblin"],
    questFinishedAt: {
      "rookless-rampage": "2026-07-02T10:00:00.000Z",
      "back-rank-goblin": "2026-07-02T11:00:00.000Z",
    },
  });
  const ranked = rankGroupQuestParticipants({
    questIds: ["rookless-rampage", "back-rank-goblin"],
    participants: [later, earlier],
  });
  assert.deepEqual(ranked.map(({ id }) => id), ["earlier", "later"]);
});

test("does not treat completion without proof timestamps as a finished quest", () => {
  const missingProofTime = participant("missing-proof-time", {
    completedQuestIds: ["rookless-rampage", "back-rank-goblin"],
    questFinishedAt: { "rookless-rampage": "2026-07-02T10:00:00.000Z" },
  });
  assert.equal(
    getGroupQuestParticipantFinishedAt(
      { questIds: ["rookless-rampage", "back-rank-goblin"] },
      missingProofTime,
    ),
    null,
  );
});

test("switches multiplayer results to first-to-complete only after verified completion", () => {
  const questIds = ["rookless-rampage", "back-rank-goblin"];
  const incomplete = participant("incomplete", { completedQuestIds: ["rookless-rampage"] });
  const complete = participant("complete", {
    completedQuestIds: questIds,
    questFinishedAt: {
      "rookless-rampage": "2026-07-02T10:00:00.000Z",
      "back-rank-goblin": "2026-07-02T11:00:00.000Z",
    },
  });
  assert.equal(getGroupQuestResultMode({ questIds, participants: [incomplete] }), "deadline-points");
  assert.equal(getGroupQuestResultMode({ questIds, participants: [incomplete, complete] }), "first-to-complete");
});

test("does not mutate the stored participant order while ranking", () => {
  const participants = [participant("lower", { score: 1 }), participant("higher", { score: 2 })];
  const ranked = rankGroupQuestParticipants({ questIds: ["rookless-rampage"], participants });
  assert.deepEqual(ranked.map(({ id }) => id), ["higher", "lower"]);
  assert.deepEqual(participants.map(({ id }) => id), ["lower", "higher"]);
});

test("lists joined quests hosted on Clerk page two once in deterministic newest-first order", async () => {
  const joined = buildGroupQuest({ hostUserId: "old-host", hostName: "Old Host", name: "Page two", startAt: "2026-07-01", endAt: "2026-07-20" });
  joined.id = "joined-page-two";
  joined.createdAt = "2026-07-10T00:00:00.000Z";
  joined.participants = [participant("current-user")];
  const older = { ...joined, id: "older", createdAt: "2026-07-01T00:00:00.000Z" };
  const duplicate = { ...joined };
  const calls: number[] = [];
  const client = { users: { getUserList: async ({ offset = 0 }: { limit: number; offset?: number }) => {
    calls.push(offset);
    if (offset === 0) return { data: Array.from({ length: 100 }, (_, index) => ({ id: `new-${index}`, privateMetadata: {} })) };
    if (offset === 100) return { data: [{ id: "old-host", privateMetadata: { sqcGroupQuests: [older, joined, duplicate] } }] };
    return { data: [] };
  } } };

  const quests = await listUserRelatedGroupQuests(client, "current-user");
  assert.deepEqual(calls, [0, 100]);
  assert.deepEqual(quests.map(({ id }) => id), ["joined-page-two", "older"]);
});

test("scans three full Clerk pages and discovers a quest on the final short page", async () => {
  const discovered = buildGroupQuest({ hostUserId: "host-350", hostName: "Host", name: "Deep quest" });
  discovered.id = "deep-quest";
  const calls: number[] = [];
  const client = { users: { getUserList: async ({ offset = 0, limit }: { limit: number; offset?: number }) => {
    calls.push(offset);
    const length = offset < 300 ? limit : 50;
    const data = Array.from({ length }, (_, index) => ({
      id: `user-${offset + index}`,
      privateMetadata: offset === 300 && index === 49 ? { sqcGroupQuests: [discovered] } : {},
    }));
    return { data, totalCount: 350 };
  } } };

  const quests = await listUserRelatedGroupQuests(client, "host-350");
  assert.deepEqual(calls, [0, 100, 200, 300]);
  assert.deepEqual(quests.map(({ id }) => id), ["deep-quest"]);
});

test("bounds changing overlapping full pages from the first valid totalCount snapshot", async () => {
  const pageThree = buildGroupQuest({ hostUserId: "current-user", hostName: "Host", name: "Page three" });
  pageThree.id = "page-three";
  const calls: number[] = [];
  const client = { users: { getUserList: async ({ offset = 0, limit }: { limit: number; offset?: number }) => {
    calls.push(offset);
    const page = calls.length;
    return {
      data: Array.from({ length: limit }, (_, index) => ({
        // Page two exactly repeats page one; page three then changes while still
        // overlapping within itself. Neither upstream behavior can affect bounds.
        id: page <= 2 ? `repeated-${index}` : `changing-${index % 50}`,
        privateMetadata: page === 3 && index === 0 ? { sqcGroupQuests: [pageThree] } : {},
      })),
      totalCount: page === 1 ? 250 : 100_000 + page,
    };
  } } };

  const quests = await listUserRelatedGroupQuests(client, "current-user");
  assert.deepEqual(calls, [0, 100, 200]);
  assert.deepEqual(quests.map(({ id }) => id), ["page-three"]);
});

test("stops at the totalCount page bound even when the last page remains full", async () => {
  const calls: number[] = [];
  const client = { users: { getUserList: async ({ offset = 0, limit }: { limit: number; offset?: number }) => {
    calls.push(offset);
    return { data: Array.from({ length: limit }, (_, index) => ({ id: `user-${offset + index}`, privateMetadata: {} })), totalCount: 200 };
  } } };

  await listUserRelatedGroupQuests(client, "current-user");
  assert.deepEqual(calls, [0, 100]);
});

test("uses the documented hard page bound when totalCount is absent or malformed", async () => {
  for (const totalCount of [undefined, Number.NaN, -1, 1.5, "many"] as const) {
    let calls = 0;
    const client = { users: { getUserList: async ({ limit }: { limit: number; offset?: number }) => {
      calls += 1;
      return {
        data: Array.from({ length: limit }, (_, index) => ({ id: `changing-${calls}-${index}`, privateMetadata: {} })),
        ...(totalCount === undefined ? {} : { totalCount: totalCount as number }),
      };
    } } };

    await listUserRelatedGroupQuests(client, "current-user");
    assert.equal(calls, CLERK_USER_SCAN_MAX_PAGES);
  }
});

test("orders equal-createdAt related quests deterministically by quest ID", async () => {
  const questB = buildGroupQuest({ hostUserId: "current-user", hostName: "Host", name: "B" });
  const questA = buildGroupQuest({ hostUserId: "current-user", hostName: "Host", name: "A" });
  questB.id = "quest-b";
  questA.id = "quest-a";
  questB.createdAt = questA.createdAt = "2026-07-10T00:00:00.000Z";
  const client = { users: { getUserList: async () => ({
    data: [{ id: "host", privateMetadata: { sqcGroupQuests: [questB, questA] } }],
    totalCount: 1,
  }) } };

  const quests = await listUserRelatedGroupQuests(client, "current-user");
  assert.deepEqual(quests.map(({ id }) => id), ["quest-a", "quest-b"]);
});

test("official participation uses a minimal bounded keyed public metadata record and reconstructs the built-in definition", () => {
  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  official.participants = [participant("current-user", {
    username: "u".repeat(200),
    leaderboardName: "n".repeat(200),
    completedQuestIds: [...official.questIds, ...Array.from({ length: 30 }, (_, index) => `unrelated-${index}`)],
    questFinishedAt: Object.fromEntries(Array.from({ length: 30 }, (_, index) => [`unrelated-${index}`, "2026-07-06T12:00:00.000Z"])),
  })];
  const unrelated = { theme: "dark", nested: { keep: true } };
  const records = upsertOfficialGroupQuestParticipation(unrelated, official, "current-user");
  const metadata = { ...unrelated, [OFFICIAL_GROUP_QUEST_METADATA_KEY]: records };

  assert.equal(JSON.stringify(records).length < 4096, true);
  assert.equal("name" in (records[official.id] as Record<string, unknown>), false);
  assert.equal("rules" in (records[official.id] as Record<string, unknown>), false);
  assert.deepEqual({ theme: metadata.theme, nested: metadata.nested }, unrelated);

  const reconstructed = getStoredOfficialGroupQuestParticipations(metadata);
  assert.equal(reconstructed.length, 1);
  assert.equal(reconstructed[0].name, official.name);
  assert.deepEqual(reconstructed[0].questIds, official.questIds);
  assert.equal(reconstructed[0].participants[0].username.length <= 60, true);
  assert.deepEqual(reconstructed[0].participants[0].completedQuestIds, official.questIds);
});

test("official participation respects Clerk public metadata byte capacity with multibyte profile data", () => {
  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  official.participants = [participant("current-user", {
    username: "spelare",
    leaderboardName: "Åsa ♞",
  })];
  const existingMetadata = { profileNote: "å".repeat(2_500) };
  const records = upsertOfficialGroupQuestParticipation(existingMetadata, official, "current-user");
  const nextMetadata = { ...existingMetadata, [OFFICIAL_GROUP_QUEST_METADATA_KEY]: records };

  assert.equal(official.id in records, true);
  assert.equal(Buffer.byteLength(JSON.stringify(nextMetadata), "utf8") <= 7_680, true);
});

test("non-official lookup prefers the host's authoritative copy over an earlier participant replica", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  const staleReplica = { ...structuredClone(canonical), name: "Stale participant copy", participants: [] };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "participant-user", privateMetadata: { sqcGroupQuests: [staleReplica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  const found = await findGroupQuestById(client, canonical.id);

  assert.equal(found?.userId, "host-user");
  assert.equal(found?.groupQuest.name, "Canonical table");
});

test("public official records merge with legacy private copies in lookup, catalogs, and user-related scans", async () => {
  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  const publicCopy = structuredClone(official);
  publicCopy.participants = [participant("public-user", { score: 100, completedQuestIds: [official.questIds[0]] })];
  const publicMetadata = {
    [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation({}, publicCopy, "public-user"),
  };
  const legacyCopy = structuredClone(official);
  legacyCopy.participants = [participant("legacy-user", { score: 200, completedQuestIds: official.questIds.slice(0, 2) })];
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "public-user", publicMetadata, privateMetadata: {} },
      { id: "legacy-user", publicMetadata: {}, privateMetadata: { sqcGroupQuests: [legacyCopy] } },
    ],
    totalCount: 2,
  }) } };

  const found = await findGroupQuestById(client, official.id);
  assert.deepEqual(found?.groupQuest.participants.map(({ userId }) => userId).sort(), ["legacy-user", "public-user"]);
  const listed = (await listPublicGroupQuests(client)).find(({ id }) => id === official.id);
  assert.deepEqual(listed?.participants.map(({ userId }) => userId).sort(), ["legacy-user", "public-user"]);
  const related = await listUserRelatedGroupQuests(client, "public-user");
  assert.equal(related.some(({ id }) => id === official.id), true);
});

test("invite lookup rejects malformed or overlong keys before querying Clerk", async () => {
  let calls = 0;
  const client = { users: { getUserList: async () => { calls += 1; return { data: [] }; } } };
  assert.equal(await findGroupQuestByInviteKey(client, "bad key!"), null);
  assert.equal(await findGroupQuestByInviteKey(client, "a".repeat(41)), null);
  assert.equal(calls, 0);
});

test("public official participation overrides stale legacy private progress exactly", async () => {
  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  const legacy = structuredClone(official);
  legacy.participants = [{ ...participant("current-user", { score: 900, completedQuestIds: official.questIds.slice(0, 2) }), provider: "lichess", username: "legacy-user", leaderboardName: "Legacy", lastProofAt: "2026-07-09T00:00:00.000Z" }];
  const current = structuredClone(official);
  current.participants = [{ ...participant("current-user", { score: 100, completedQuestIds: [official.questIds[0]], joinedAt: "2026-07-02T00:00:00.000Z", questFinishedAt: { [official.questIds[0]]: "2026-07-03T00:00:00.000Z" } }), provider: "chesscom", username: "public-user", leaderboardName: "Public", lastProofAt: "2026-07-04T00:00:00.000Z" }];
  const client = { users: { getUserList: async () => ({ data: [{
    id: "current-user",
    privateMetadata: { sqcGroupQuests: [legacy] },
    publicMetadata: { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation({}, current, "current-user") },
  }], totalCount: 1 }) } };

  const [related] = await listUserRelatedGroupQuests(client, "current-user");
  assert.deepEqual(related.participants[0], {
    userId: "current-user", provider: "chesscom", username: "public-user", leaderboardName: "Public",
    joinedAt: "2026-07-02T00:00:00.000Z", score: 100, completedQuestIds: [official.questIds[0]],
    questFinishedAt: { [official.questIds[0]]: "2026-07-03T00:00:00.000Z" }, lastProofSummary: undefined,
    lastProofAt: "2026-07-04T00:00:00.000Z",
  });
});

test("rejoining clears a legacy left tombstone under Clerk deep merge", () => {
  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  official.participants = [participant("current-user")];
  const existingEntry = { active: false, left: true, leftAt: "2026-07-05T00:00:00.000Z" };
  const metadata = { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: { [official.id]: existingEntry } };
  const patch = upsertOfficialGroupQuestParticipation(metadata, official, "current-user");
  const deeplyMergedEntry = { ...existingEntry, ...patch[official.id] };
  const deeplyMergedMetadata = { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: { [official.id]: deeplyMergedEntry } };

  assert.equal(deeplyMergedEntry.left, false);
  assert.equal(getStoredOfficialGroupQuestParticipations(deeplyMergedMetadata, "current-user").length, 1);
});

test("rejects calendar-rollover official metadata ids", () => {
  const malformedId = "official-royal-route-2026-02-31";
  const metadata = { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: { [malformedId]: {
    active: true, left: false, provider: "lichess", username: "player", leaderboardName: "Player", joinedAt: "2026-02-01T00:00:00.000Z",
  } } };
  assert.deepEqual(getStoredOfficialGroupQuestParticipations(metadata, "current-user"), []);
});

test("supports the branch legacy array official metadata shape", () => {
  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  const arrayMetadata = { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: [{ questId: official.id, provider: "lichess", username: "array-user", leaderboardName: "Array", joinedAt: "2026-07-01T00:00:00.000Z" }] };
  assert.equal(getStoredOfficialGroupQuestParticipations(arrayMetadata, "user")[0].participants[0].username, "array-user");
});

for (const lookup of ["id", "invite", "catalog"] as const) {
  test(`${lookup} scan uses the hard page bound when Clerk never returns a short page or totalCount`, async () => {
    let calls = 0;
    const client = { users: { getUserList: async ({ limit }: { limit: number }) => {
      calls += 1;
      return { data: Array.from({ length: limit }, (_, index) => ({ id: `u-${calls}-${index}`, privateMetadata: {} })) };
    } } };
    if (lookup === "id") await findGroupQuestById(client, "missing");
    else if (lookup === "invite") await findGroupQuestByInviteKey(client, "missing-key");
    else await listPublicGroupQuests(client);
    assert.equal(calls, CLERK_USER_SCAN_MAX_PAGES);
  });
}