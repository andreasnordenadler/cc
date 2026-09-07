import assert from "node:assert/strict";
import test from "node:test";

import { CLERK_USER_SCAN_MAX_PAGES, OFFICIAL_GROUP_QUEST_METADATA_KEY, buildGroupQuest, buildParticipant, findGroupQuestById, findGroupQuestByInviteKey, getBuiltInOfficialGroupQuests, getGroupQuestParticipantFinishedAt, getGroupQuestResultMode, getStoredGroupQuests, getStoredOfficialGroupQuestParticipations, listPublicGroupQuests, listUserRelatedGroupQuests, rankGroupQuestParticipants, upsertOfficialGroupQuestParticipation } from "../src/lib/groupquests";
import { withPublishedRunnerIdentity } from "../src/lib/user-metadata";

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

test("public Community loading does not resurrect a stale public replica after the host makes it private", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Private canonical table", inviteMode: "private-key" });
  canonical.id = "private-canonical-public-replica";
  canonical.participants = [];
  const staleReplica = {
    ...structuredClone(canonical),
    inviteMode: "public" as const,
    name: "Stale public participant copy",
    participants: [participant("removed-viewer", { score: 300 })],
  };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "removed-viewer", privateMetadata: { sqcGroupQuests: [staleReplica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  const listed = await listPublicGroupQuests(client);

  assert.equal(listed.some(({ id }) => id === canonical.id), false);
});

test("public Community loading prefers the host record over a stale participant replica", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical public table", inviteMode: "public" });
  canonical.id = "public-replica-table";
  canonical.participants = [participant("teammate", { score: 100 })];
  const staleReplica = {
    ...structuredClone(canonical),
    name: "Stale public participant copy",
    participants: [participant("removed-viewer", { score: 300 })],
  };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "removed-viewer", privateMetadata: { sqcGroupQuests: [staleReplica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  const listed = (await listPublicGroupQuests(client)).find(({ id }) => id === canonical.id);

  assert.equal(listed?.name, "Canonical public table");
  assert.deepEqual(listed?.participants.map(({ userId }) => userId), ["teammate"]);
});

test("public Community loading hides legacy Multiplayer quests with objectionable public metadata", async () => {
  const safe = buildGroupQuest({ hostUserId: "safe-host", hostName: "Safe Host", name: "Friendly table", inviteMode: "public" });
  const unsafeName = buildGroupQuest({ hostUserId: "name-host", hostName: "Host", name: "f u c k table", inviteMode: "public" });
  const unsafeHost = buildGroupQuest({ hostUserId: "unsafe-host", hostName: "sh1t host", name: "Normal table", inviteMode: "public" });
  const unsafeSnapshot = buildGroupQuest({ hostUserId: "snapshot-host", hostName: "Host", name: "Normal table", inviteMode: "public" });
  unsafeSnapshot.customQuestSnapshots = [{ id: "legacy-custom", title: "Normal title", summary: "c.u.n.t summary", config: "win" }];
  const quests = [safe, unsafeName, unsafeHost, unsafeSnapshot];
  const client = { users: { getUserList: async () => ({
    data: quests.map((quest) => ({ id: quest.hostUserId, privateMetadata: { sqcGroupQuests: [quest] } })),
    totalCount: quests.length,
  }) } };

  const listed = await listPublicGroupQuests(client);

  assert.deepEqual(listed.filter((quest) => !quest.official).map(({ id }) => id), [safe.id]);
});

test("public Community loading hides legacy Multiplayer quests with objectionable leaderboard names", async () => {
  const quest = buildGroupQuest({ hostUserId: "host-user", hostName: "Safe Host", name: "Friendly table", inviteMode: "public" });
  quest.participants = [participant("unsafe-player", { leaderboardName: "f.u.c.k" })];
  const client = { users: { getUserList: async () => ({
    data: [{ id: quest.hostUserId, privateMetadata: { sqcGroupQuests: [quest] } }],
    totalCount: 1,
  }) } };

  const listed = await listPublicGroupQuests(client);

  assert.equal(listed.some(({ id }) => id === quest.id), false);
});

test("related quest loading prefers the host record over an earlier participant replica", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table", inviteMode: "private-key" });
  canonical.id = "related-replica-table";
  canonical.participants = [
    participant("current-user", { score: 300, completedQuestIds: canonical.questIds }),
    participant("teammate", { score: 100 }),
  ];
  const staleReplica = {
    ...structuredClone(canonical),
    name: "Stale participant copy",
    participants: [participant("current-user", { score: 10 })],
  };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "current-user", privateMetadata: { sqcGroupQuests: [staleReplica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  const [related] = await listUserRelatedGroupQuests(client, "current-user");

  assert.equal(related.name, "Canonical table");
  assert.deepEqual(related.participants.map(({ userId, score }) => [userId, score]), [
    ["current-user", 300],
    ["teammate", 100],
  ]);
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

test("non-official lookup fails closed when two storage owners claim the same quest", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  const forgedOwnerReplica = { ...structuredClone(canonical), hostUserId: "attacker-user", inviteKey: "PRIVATE-KEY" };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "attacker-user", privateMetadata: { sqcGroupQuests: [forgedOwnerReplica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  assert.equal(await findGroupQuestById(client, canonical.id), null);
});

test("non-official lookup accepts a canonical owner at an exact total-count page boundary", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  const client = { users: { getUserList: async ({ limit }: { limit: number }) => ({
    data: Array.from({ length: limit }, (_, index) => index === 0
      ? { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } }
      : { id: `user-${index}`, privateMetadata: {} }),
    totalCount: limit,
  }) } };

  const found = await findGroupQuestById(client, canonical.id);
  assert.equal(found?.userId, "host-user");
});

test("non-official lookup ignores a late total that could hide a conflicting owner", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  const conflicting = { ...structuredClone(canonical), hostUserId: "other-host" };
  let page = 0;
  const client = { users: { getUserList: async ({ limit }: { limit: number }) => {
    page += 1;
    if (page === 3) {
      return { data: [{ id: "other-host", privateMetadata: { sqcGroupQuests: [conflicting] } }], totalCount: 100 };
    }
    return {
      data: Array.from({ length: limit }, (_, index) => page === 1 && index === 0
        ? { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } }
        : { id: `user-${page}-${index}`, privateMetadata: {} }),
      ...(page === 2 ? { totalCount: 100 } : {}),
    };
  } } };

  assert.equal(await findGroupQuestById(client, canonical.id), null);
  assert.equal(page, 3);
});

test("non-official lookup rejects a full final page that contradicts a non-multiple total count", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  let page = 0;
  const client = { users: { getUserList: async ({ limit }: { limit: number }) => {
    page += 1;
    return {
      data: Array.from({ length: limit }, (_, index) => page === 1 && index === 0
        ? { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } }
        : { id: `user-${page}-${index}`, privateMetadata: {} }),
      totalCount: 150,
    };
  } } };

  assert.equal(await findGroupQuestById(client, canonical.id), null);
  assert.equal(page, 2);
});

test("non-official lookup rejects a short final page that contradicts the snapshotted total count", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  let page = 0;
  const client = { users: { getUserList: async ({ limit }: { limit: number }) => {
    page += 1;
    const length = page === 1 ? limit : 50;
    return {
      data: Array.from({ length }, (_, index) => page === 1 && index === 0
        ? { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } }
        : { id: `user-${page}-${index}`, privateMetadata: {} }),
      totalCount: 200,
    };
  } } };

  assert.equal(await findGroupQuestById(client, canonical.id), null);
  assert.equal(page, 2);
});

test("non-official lookup fails closed when a hard-bounded scan never proves completion", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Canonical table" });
  canonical.id = "community-table";
  let page = 0;
  const client = { users: { getUserList: async ({ limit }: { limit: number }) => {
    page += 1;
    return {
      data: Array.from({ length: limit }, (_, index) => page === 1 && index === 0
        ? { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } }
        : { id: `user-${page}-${index}`, privateMetadata: {} }),
    };
  } } };

  assert.equal(await findGroupQuestById(client, canonical.id), null);
  assert.equal(page, CLERK_USER_SCAN_MAX_PAGES);
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

test("private invite lookup prefers the host's canonical copy over an earlier participant replica", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Private table", inviteMode: "private-key", inviteKey: "ROOK-742" });
  canonical.id = "private-table";
  canonical.participants = [participant("participant-user")];
  const staleReplica = { ...structuredClone(canonical), name: "Stale participant copy", participants: [participant("participant-user")] };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "participant-user", privateMetadata: { sqcGroupQuests: [staleReplica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  const found = await findGroupQuestByInviteKey(client, "rook-742");

  assert.equal(found?.userId, "host-user");
  assert.equal(found?.groupQuest.name, "Private table");
});

test("private invite lookup fails closed when only a participant replica remains", async () => {
  const replica = buildGroupQuest({ hostUserId: "missing-host", hostName: "Host", name: "Private table", inviteMode: "private-key", inviteKey: "ROOK-742" });
  replica.id = "private-table";
  replica.participants = [participant("participant-user")];
  const client = { users: { getUserList: async () => ({
    data: [{ id: "participant-user", privateMetadata: { sqcGroupQuests: [replica] } }],
    totalCount: 1,
  }) } };

  assert.equal(await findGroupQuestByInviteKey(client, "ROOK-742"), null);
});

test("private invite lookup ignores a late total that could hide a conflicting owner", async () => {
  const canonical = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name: "Private table", inviteMode: "private-key", inviteKey: "ROOK-742" });
  canonical.id = "private-table";
  const forged = { ...structuredClone(canonical), hostUserId: "attacker-user", name: "Forged table" };
  let page = 0;
  const client = { users: { getUserList: async ({ limit }: { limit: number }) => {
    page += 1;
    if (page === 1) return { data: Array.from({ length: limit }, (_, index) => index === 0
      ? { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } }
      : { id: `page-one-${index}`, privateMetadata: {} }), totalCount: Number.NaN };
    if (page === 2) return { data: Array.from({ length: limit }, (_, index) => ({ id: `page-two-${index}`, privateMetadata: {} })), totalCount: limit };
    return { data: [{ id: "attacker-user", privateMetadata: { sqcGroupQuests: [forged] } }] };
  } } };

  assert.equal(await findGroupQuestByInviteKey(client, "ROOK-742"), null);
  assert.equal(page, 3);
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

test("official Multiplayer Side Quests run in weekly windows", () => {
  const thursday = getBuiltInOfficialGroupQuests(new Date("2026-08-13T12:00:00.000Z"));
  const sunday = getBuiltInOfficialGroupQuests(new Date("2026-08-16T23:59:59.000Z"));
  const monday = getBuiltInOfficialGroupQuests(new Date("2026-08-17T00:00:00.000Z"));

  assert.equal(thursday.length, 3);
  assert.deepEqual(thursday.map((quest) => [quest.startAt, quest.endAt]), [
    ["2026-08-10T00:00:00.000Z", "2026-08-17T00:00:00.000Z"],
    ["2026-08-10T00:00:00.000Z", "2026-08-17T00:00:00.000Z"],
    ["2026-08-10T00:00:00.000Z", "2026-08-17T00:00:00.000Z"],
  ]);
  assert.deepEqual(sunday.map((quest) => quest.id), thursday.map((quest) => quest.id));
  assert.notDeepEqual(monday.map((quest) => quest.id), thursday.map((quest) => quest.id));
  assert.ok(monday.every((quest) => quest.startAt === "2026-08-17T00:00:00.000Z" && quest.endAt === "2026-08-24T00:00:00.000Z"));
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

test("normalizes the retired public acronym in stored official labels", () => {
  const legacy = buildGroupQuest({ hostUserId: "host", hostName: "Host", name: "Legacy official", startAt: "2026-07-01", endAt: "2026-07-20" });
  legacy.official = true;
  legacy.officialLabel = "Official SQC · 14 days";
  legacy.hostName = "SQC host";
  legacy.participants = [participant("legacy-runner", { leaderboardName: "SQC player" })];

  const [stored] = getStoredGroupQuests({ sqcGroupQuests: [legacy] });
  assert.equal(stored.officialLabel, "Official Side Quest Chess · 14 days");
  assert.equal(stored.hostName, "Quest host");
  assert.equal(stored.participants[0].leaderboardName, "Quest runner");
});

test("stored Multiplayer readers migrate legacy email identities to neutral names", () => {
  const loginEmail = "private.login@example.test";
  const hosted = buildGroupQuest({ hostUserId: "host", hostName: loginEmail, name: "Legacy hosted" });
  hosted.participants = [participant("legacy-runner", { leaderboardName: loginEmail })];
  const [storedHosted] = getStoredGroupQuests({ sqcGroupQuests: [hosted] });

  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  const [storedOfficial] = getStoredOfficialGroupQuestParticipations({
    [OFFICIAL_GROUP_QUEST_METADATA_KEY]: {
      [official.id]: {
        active: true,
        left: false,
        provider: "lichess",
        username: "public-chess-name",
        leaderboardName: loginEmail,
        joinedAt: "2026-07-01T12:00:00.000Z",
      },
    },
  }, "official-runner");

  assert.equal(storedHosted.hostName, "Quest host");
  assert.equal(storedHosted.participants[0].leaderboardName, "Quest runner");
  assert.equal(storedOfficial.participants[0].leaderboardName, "Quest runner");
});

test("stored Multiplayer readers detect emails before limiting identity length", () => {
  const loginEmail = `${"private".repeat(14)}@example.test`;
  const hosted = buildGroupQuest({ hostUserId: "host", hostName: "Temporary", name: "Legacy hosted" });
  hosted.hostName = loginEmail;
  hosted.participants = [participant("legacy-runner", { leaderboardName: loginEmail })];
  const [storedHosted] = getStoredGroupQuests({ sqcGroupQuests: [hosted] });

  const official = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0];
  const [storedOfficial] = getStoredOfficialGroupQuestParticipations({
    [OFFICIAL_GROUP_QUEST_METADATA_KEY]: {
      [official.id]: {
        active: true,
        left: false,
        provider: "lichess",
        username: "public-chess-name",
        leaderboardName: loginEmail,
        joinedAt: "2026-07-01T12:00:00.000Z",
      },
    },
  }, "official-runner");

  assert.equal(storedHosted.hostName, "Quest host");
  assert.equal(storedHosted.participants[0].leaderboardName, "Quest runner");
  assert.equal(storedOfficial.participants[0].leaderboardName, "Quest runner");
});

test("Clerk-backed loaders redact identities truncated by the historical writer", async () => {
  const participantEmail = `${"p".repeat(60)}@private.example.test`;
  const historicalParticipant = buildParticipant({
    userId: "legacy-runner",
    provider: "lichess",
    username: "public-chess-name",
    leaderboardName: participantEmail,
  });
  assert.ok(historicalParticipant);
  assert.equal(historicalParticipant.leaderboardName, "p".repeat(60));

  const hosted = buildGroupQuest({
    hostUserId: "host-user",
    hostName: "Public Host Alias",
    name: "Legacy hosted",
    inviteMode: "public",
  });
  hosted.participants = [historicalParticipant];
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "host-user", emailAddresses: [], privateMetadata: { sqcGroupQuests: [hosted] } },
      { id: "legacy-runner", emailAddresses: [{ emailAddress: participantEmail }], privateMetadata: {} },
    ],
    totalCount: 2,
  }) } };

  const publicQuest = (await listPublicGroupQuests(client)).find(({ id }) => id === hosted.id);
  const [relatedQuest] = await listUserRelatedGroupQuests(client, "legacy-runner");

  assert.equal(publicQuest?.hostName, "Public Host Alias");
  assert.equal(publicQuest?.participants[0]?.leaderboardName, "Quest runner");
  assert.equal(relatedQuest?.participants[0]?.leaderboardName, "Quest runner");
  assert.equal(JSON.stringify([publicQuest, relatedQuest]).includes("p".repeat(60)), false);
});

test("Clerk-backed loaders redact host names truncated by the historical profile writer", async () => {
  const emailPrefix = "h".repeat(60);
  const loginEmail = `${emailPrefix}@private.example.test`;
  const hosted = buildGroupQuest({
    hostUserId: "host-user",
    hostName: emailPrefix,
    name: "Legacy hosted",
    inviteMode: "public",
  });
  const client = { users: { getUserList: async () => ({
    data: [{
      id: "host-user",
      emailAddresses: [{ emailAddress: loginEmail }],
      publicMetadata: { runnerDisplayName: emailPrefix },
      privateMetadata: { sqcGroupQuests: [hosted] },
    }],
    totalCount: 1,
  }) } };

  const publicQuest = (await listPublicGroupQuests(client)).find(({ id }) => id === hosted.id);

  assert.equal(publicQuest?.hostName, "Quest host");
  assert.equal(JSON.stringify(publicQuest).includes(emailPrefix), false);
});

test("public catalog resolves historical identity provenance beyond the scan cap", async () => {
  const participantEmail = `${"p".repeat(60)}@private.example.test`;
  const historicalParticipant = buildParticipant({
    userId: "legacy-runner",
    provider: "lichess",
    username: "public-chess-name",
    leaderboardName: participantEmail,
  });
  assert.ok(historicalParticipant);
  const hosted = buildGroupQuest({
    hostUserId: "host-user",
    hostName: "Public Host Alias",
    name: "Legacy hosted",
    inviteMode: "public",
  });
  hosted.participants = [historicalParticipant];
  let directLookups = 0;
  const client = { users: {
    getUserList: async ({ limit, offset = 0 }: { limit: number; offset?: number }) => ({
      data: Array.from({ length: limit }, (_, index) => offset === 0 && index === 0
        ? { id: "host-user", emailAddresses: [], privateMetadata: { sqcGroupQuests: [hosted] } }
        : { id: `user-${offset + index}`, privateMetadata: {} }),
    }),
    getUser: async (userId: string) => {
      directLookups += 1;
      assert.equal(userId, "legacy-runner");
      return { id: userId, emailAddresses: [{ emailAddress: participantEmail }], privateMetadata: {} };
    },
  } };

  const publicQuest = (await listPublicGroupQuests(client)).find(({ id }) => id === hosted.id);
  const relatedQuest = (await listUserRelatedGroupQuests(client, "legacy-runner")).find(({ id }) => id === hosted.id);

  assert.equal(publicQuest?.participants[0]?.leaderboardName, "Quest runner");
  assert.equal(relatedQuest?.participants[0]?.leaderboardName, "Quest runner");
  assert.equal(directLookups, 2);
});

test("public catalog resolves historical host profile prefixes beyond the scan cap", async () => {
  const emailPrefix = "h".repeat(60);
  const loginEmail = `${emailPrefix}@private.example.test`;
  const hosted = buildGroupQuest({
    hostUserId: "legacy-host",
    hostName: emailPrefix,
    name: "Legacy hosted",
    inviteMode: "public",
  });
  let directLookups = 0;
  const client = { users: {
    getUserList: async ({ limit, offset = 0 }: { limit: number; offset?: number }) => ({
      data: Array.from({ length: limit }, (_, index) => offset === 0 && index === 0
        ? { id: "replica-user", privateMetadata: { sqcGroupQuests: [hosted] } }
        : { id: `user-${offset + index}`, privateMetadata: {} }),
    }),
    getUser: async (userId: string) => {
      directLookups += 1;
      assert.equal(userId, "legacy-host");
      return { id: userId, emailAddresses: [{ emailAddress: loginEmail }], privateMetadata: {} };
    },
  } };

  const publicQuest = (await listPublicGroupQuests(client)).find(({ id }) => id === hosted.id);

  assert.equal(publicQuest?.hostName, "Quest host");
  assert.equal(directLookups, 1);
});

test("public catalog redacts a maximum-length identity when provenance is unavailable", async () => {
  const hosted = buildGroupQuest({
    hostUserId: "host-user",
    hostName: "Public Host Alias",
    name: "Legacy hosted",
    inviteMode: "public",
  });
  hosted.participants = [participant("deleted-runner", { leaderboardName: "p".repeat(60) })];
  const unrelated = buildGroupQuest({
    hostUserId: "other-host",
    hostName: "Other Host",
    name: "Unrelated table",
    inviteMode: "public",
  });
  const client = { users: {
    getUserList: async () => ({
      data: [
        { id: "host-user", emailAddresses: [], privateMetadata: { sqcGroupQuests: [hosted] } },
        { id: "other-host", emailAddresses: [], privateMetadata: { sqcGroupQuests: [unrelated] } },
      ],
      totalCount: 2,
    }),
    getUser: async (userId: string) => {
      assert.equal(userId, "deleted-runner");
      throw new Error("user_not_found");
    },
  } };

  const listed = await listPublicGroupQuests(client);

  assert.deepEqual(listed.filter(({ official }) => !official).map(({ name }) => name).sort(), ["Legacy hosted", "Unrelated table"]);
  assert.equal(listed.find(({ id }) => id === hosted.id)?.participants[0]?.leaderboardName, "Quest runner");
});

test("public catalog redacts a historical 60-character host prefix when provenance is unavailable", async () => {
  const hosted = buildGroupQuest({
    hostUserId: "deleted-host",
    hostName: "h".repeat(60),
    name: "Legacy hosted",
    inviteMode: "public",
  });
  const client = { users: {
    getUserList: async () => ({
      data: [{ id: "replica-user", privateMetadata: { sqcGroupQuests: [hosted] } }],
      totalCount: 1,
    }),
    getUser: async () => {
      throw new Error("user_not_found");
    },
  } };

  const listed = await listPublicGroupQuests(client);

  assert.equal(listed.find(({ id }) => id === hosted.id)?.hostName, "Quest host");
});

test("public catalog preserves a maximum-length alias with trusted profile provenance", async () => {
  const alias = "a".repeat(60);
  const hosted = buildGroupQuest({
    hostUserId: "profile-runner",
    hostName: alias,
    name: "Legacy hosted",
    inviteMode: "public",
  });
  hosted.participants = [participant("profile-runner", { leaderboardName: alias })];
  const client = { users: {
    getUserList: async () => ({
      data: [
        {
          id: "profile-runner",
          username: "PublicKnight",
          emailAddresses: [],
          publicMetadata: withPublishedRunnerIdentity({}, alias),
          privateMetadata: { sqcGroupQuests: [hosted] },
        },
      ],
      totalCount: 1,
    }),
  } };

  const listed = await listPublicGroupQuests(client);

  assert.equal(listed.find(({ id }) => id === hosted.id)?.participants[0]?.leaderboardName, alias);
});

test("supplemental identity lookup preserves its Clerk client receiver", async () => {
  const alias = "a".repeat(60);
  const hosted = buildGroupQuest({
    hostUserId: "host-user",
    hostName: "Public Host",
    name: "Legacy hosted",
    inviteMode: "public",
  });
  hosted.participants = [participant("profile-runner", { leaderboardName: alias })];
  const users = {
    getUserList: async () => ({
      data: [{ id: "host-user", privateMetadata: { sqcGroupQuests: [hosted] } }],
      totalCount: 1,
    }),
    async getUser(userId: string) {
      assert.equal(this, users);
      assert.equal(userId, "profile-runner");
      return {
        id: userId,
        emailAddresses: [],
        publicMetadata: withPublishedRunnerIdentity({}, alias),
        privateMetadata: {},
      };
    },
  };

  const listed = await listPublicGroupQuests({ users });

  assert.equal(listed.find(({ id }) => id === hosted.id)?.participants[0]?.leaderboardName, alias);
});

test("public catalog bounds supplemental identity lookups and redacts unresolved identities", async () => {
  const quests = ["First", "Second"].map((name, questIndex) => {
    const quest = buildGroupQuest({ hostUserId: "host-user", hostName: "Host", name, inviteMode: "public" });
    quest.id = `legacy-${questIndex}`;
    quest.participants = Array.from({ length: 60 }, (_, participantIndex) => participant(
      `runner-${questIndex}-${participantIndex}`,
      { leaderboardName: `${questIndex}${String(participantIndex).padStart(2, "0")}${"a".repeat(57)}` },
    ));
    return quest;
  });
  let directLookups = 0;
  const client = { users: {
    getUserList: async () => ({
      data: [{ id: "host-user", emailAddresses: [], privateMetadata: { sqcGroupQuests: quests } }],
      totalCount: 1,
    }),
    getUser: async (userId: string) => {
      directLookups += 1;
      return { id: userId, emailAddresses: [], privateMetadata: {} };
    },
  } };

  const listed = await listPublicGroupQuests(client);
  const participantNames = listed.filter(({ official }) => !official).flatMap(({ participants }) => participants.map(({ leaderboardName }) => leaderboardName));

  assert.equal(directLookups, 100);
  assert.equal(participantNames.filter((name) => name === "Quest runner").length, 120);
  assert.equal(participantNames.length, 120);
});

test("public catalog stops stalled optional identity lookups at an elapsed-time deadline", async () => {
  const hosted = buildGroupQuest({
    hostUserId: "stalled-host",
    hostName: "h".repeat(60),
    name: "Still available",
    inviteMode: "public",
  });
  const client = { users: {
    getUserList: async () => ({
      data: [{ id: "storage-owner", emailAddresses: [], privateMetadata: { sqcGroupQuests: [hosted] } }],
      totalCount: 1,
    }),
    getUser: async () => new Promise<never>(() => undefined),
  } };

  let deadlineTimer: NodeJS.Timeout | undefined;
  const listed = await Promise.race([
    listPublicGroupQuests(client),
    new Promise<never>((_resolve, reject) => {
      deadlineTimer = setTimeout(() => reject(new Error("optional identity lookup exceeded deadline")), 750);
    }),
  ]);
  if (deadlineTimer) clearTimeout(deadlineTimer);

  assert.equal(listed.find(({ id }) => id === hosted.id)?.hostName, "Quest host");
});

test("exact-resource Clerk loaders redact identities truncated by the historical writer", async () => {
  const participantEmail = `${"p".repeat(60)}@private.example.test`;
  const historicalParticipant = buildParticipant({
    userId: "legacy-runner",
    provider: "lichess",
    username: "public-chess-name",
    leaderboardName: participantEmail,
  });
  assert.ok(historicalParticipant);
  const hosted = buildGroupQuest({
    hostUserId: "host-user",
    hostName: "Public Host Alias",
    name: "Legacy hosted",
    inviteMode: "private-key",
    inviteKey: "ROOK-742",
  });
  hosted.participants = [historicalParticipant];
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "host-user", emailAddresses: [], privateMetadata: { sqcGroupQuests: [hosted] } },
      { id: "legacy-runner", emailAddresses: [{ emailAddress: participantEmail }], privateMetadata: {} },
    ],
    totalCount: 2,
  }) } };

  const byId = await findGroupQuestById(client, hosted.id);
  const byInvite = await findGroupQuestByInviteKey(client, "ROOK-742");

  assert.equal(byId?.groupQuest.participants[0]?.leaderboardName, "Quest runner");
  assert.equal(byInvite?.groupQuest.participants[0]?.leaderboardName, "Quest runner");
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