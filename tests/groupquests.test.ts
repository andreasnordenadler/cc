import assert from "node:assert/strict";
import test from "node:test";

import { buildGroupQuest, findGroupQuestByInviteKey, getGroupQuestParticipantFinishedAt, getGroupQuestResultMode, listUserRelatedGroupQuests, rankGroupQuestParticipants } from "../src/lib/groupquests";

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

test("invite lookup rejects malformed or overlong keys before querying Clerk", async () => {
  let calls = 0;
  const client = { users: { getUserList: async () => { calls += 1; return { data: [] }; } } };
  assert.equal(await findGroupQuestByInviteKey(client, "bad key!"), null);
  assert.equal(await findGroupQuestByInviteKey(client, "a".repeat(41)), null);
  assert.equal(calls, 0);
});