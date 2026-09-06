import assert from "node:assert/strict";
import test from "node:test";
import {
  OFFICIAL_GROUP_QUEST_METADATA_KEY,
  findGroupQuestById,
  findGroupQuestByInviteKey,
  getBuiltInOfficialGroupQuests,
  listPublicGroupQuests,
  listUserRelatedGroupQuests,
  rankGroupQuestParticipants,
  upsertOfficialGroupQuestParticipation,
} from "../src/lib/groupquests";

test("official reconstruction retains a page-two winner beyond the hosted admission cap", async () => {
  const quest = getBuiltInOfficialGroupQuests()[0];
  const winnerId = "player-100";
  const finishedAt = new Date(Date.parse(quest.startAt) + 60_000).toISOString();
  const users = Array.from({ length: 101 }, (_, index) => {
    const userId = `player-${index}`;
    const participant = {
      userId, provider: "lichess" as const, username: userId, leaderboardName: userId,
      joinedAt: quest.startAt, score: index === 100 ? 300 : 0,
      completedQuestIds: index === 100 ? [...quest.questIds] : [],
      questFinishedAt: index === 100 ? Object.fromEntries(quest.questIds.map((id) => [id, finishedAt])) : {},
      ...(index === 100 ? { lastProofAt: finishedAt } : {}),
    };
    const copy = { ...quest, participants: [participant] };
    return {
      id: userId,
      publicMetadata: { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: upsertOfficialGroupQuestParticipation({}, copy, userId) },
      privateMetadata: {},
    };
  });
  const offsets: number[] = [];
  const client = { users: { getUserList: async ({ limit, offset = 0 }: { limit: number; offset?: number }) => {
    offsets.push(offset);
    return { data: users.slice(offset, offset + limit), totalCount: users.length };
  } } };
  const found = await findGroupQuestById(client, quest.id);
  assert.ok(found);
  assert.equal(found.groupQuest.participants.length, 101);
  assert.equal(rankGroupQuestParticipants(found.groupQuest)[0].userId, winnerId);
  assert.deepEqual(offsets, [0, 100]);

  for (const load of [
    async () => (await findGroupQuestByInviteKey(client, quest.inviteKey!))?.groupQuest,
    async () => (await listPublicGroupQuests(client)).find(({ id }) => id === quest.id),
    async () => (await listUserRelatedGroupQuests(client, winnerId)).find(({ id }) => id === quest.id),
  ]) {
    offsets.length = 0;
    const reconstructed = await load();
    assert.ok(reconstructed);
    assert.equal(reconstructed.participants.length, 101);
    assert.equal(new Set(reconstructed.participants.map(({ userId }) => userId)).size, 101);
    assert.equal(rankGroupQuestParticipants(reconstructed)[0].userId, winnerId);
    assert.deepEqual(reconstructed.participants.find(({ userId }) => userId === winnerId)?.questFinishedAt,
      Object.fromEntries(quest.questIds.map((id) => [id, finishedAt])));
    assert.ok(offsets.includes(100));
  }
});
