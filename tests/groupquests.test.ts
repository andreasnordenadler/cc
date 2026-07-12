import assert from "node:assert/strict";
import test from "node:test";

import { CLERK_USER_SCAN_MAX_PAGES, buildGroupQuest, findGroupQuestByInviteKey, getBuiltInOfficialGroupQuests, getGroupQuestParticipantFinishedAt, getGroupQuestResultMode, listUserRelatedGroupQuests, rankGroupQuestParticipants } from "../src/lib/groupquests";

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

test("built-in official Multiplayer content matches the Android catalog without fake live data", () => {
  const quests = getBuiltInOfficialGroupQuests(new Date("2026-07-12T12:00:00.000Z"));
  assert.deepEqual(quests.map(({ name, inviteCopy, questIds, participants }) => ({ name, inviteCopy, questIds, participants })), [
    {
      name: "Knights Before Coffee Rush",
      inviteCopy: "Complete Knights Before Coffee and Early King Walk before the official window closes.",
      questIds: ["knights-before-coffee", "early-king-walk"],
      participants: [],
    },
    {
      name: "No Castle Club Night",
      inviteCopy: "Complete No Castle Club and Early King Walk before the official window closes.",
      questIds: ["no-castle-club", "early-king-walk"],
      participants: [],
    },
    {
      name: "Queenless Cup",
      inviteCopy: "Complete Queen? Never Heard of Her and The Blunder Gambit before the official window closes.",
      questIds: ["queen-never-heard-of-her", "the-blunder-gambit"],
      participants: [],
    },
  ]);
});

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

test("invite lookup rejects malformed or overlong keys before querying Clerk", async () => {
  let calls = 0;
  const client = { users: { getUserList: async () => { calls += 1; return { data: [] }; } } };
  assert.equal(await findGroupQuestByInviteKey(client, "bad key!"), null);
  assert.equal(await findGroupQuestByInviteKey(client, "a".repeat(41)), null);
  assert.equal(calls, 0);
});