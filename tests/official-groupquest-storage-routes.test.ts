import assert from "node:assert/strict";
import test from "node:test";

import { saveWebJoinedQuest } from "../src/app/api/groupquests/[id]/join/route";
import { saveWebOfficialQuestLeave } from "../src/app/api/groupquests/[id]/leave/route";
import { saveMobileGroupQuest } from "../src/app/api/mobile/groupquests/[id]/route";
import { OFFICIAL_GROUP_QUEST_METADATA_KEY, buildGroupQuest, findGroupQuestById, getBuiltInOfficialGroupQuests, listPublicGroupQuests, listUserRelatedGroupQuests, type ServerGroupQuest } from "../src/lib/groupquests";

function participantQuest(official: boolean): ServerGroupQuest {
  const quest = official
    ? getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[0]
    : buildGroupQuest({ hostUserId: "community-host", hostName: "Host", name: "Community" });
  quest.participants = [{
    userId: "joiner",
    provider: "lichess",
    username: "linked-user",
    leaderboardName: "Linked User",
    joinedAt: "2026-07-06T12:00:00.000Z",
    score: 0,
    completedQuestIds: [],
    questFinishedAt: {},
  }];
  return quest;
}

function fakeClient() {
  const writes: Array<{ userId: string; metadata: Record<string, unknown> }> = [];
  const users = new Map([
    ["joiner", { id: "joiner", publicMetadata: { theme: "dark" }, privateMetadata: { keepPrivate: true } }],
    ["community-host", { id: "community-host", publicMetadata: { keepPublic: true }, privateMetadata: { hostSecret: "keep" } }],
  ]);
  return {
    writes,
    client: {
      users: {
        getUser: async (userId: string) => users.get(userId)!,
        updateUserMetadata: async (userId: string, metadata: Record<string, unknown>) => { writes.push({ userId, metadata }); },
      },
    },
  };
}

function deepMerge(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(patch)) {
    result[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(result[key] && typeof result[key] === "object" && !Array.isArray(result[key]) ? result[key] as Record<string, unknown> : {}, value as Record<string, unknown>)
      : value;
  }
  return result;
}

function statefulClient(initialPublic: Record<string, unknown>, initialPrivate: Record<string, unknown>) {
  const user = { id: "joiner", publicMetadata: structuredClone(initialPublic), privateMetadata: structuredClone(initialPrivate) };
  const writes: Array<Record<string, unknown>> = [];
  return {
    user,
    writes,
    client: { users: {
      getUser: async () => user,
      getUserList: async () => ({ data: [user], totalCount: 1 }),
      updateUserMetadata: async (_userId: string, metadataPatch: Record<string, unknown>) => {
        writes.push(structuredClone(metadataPatch));
        user.publicMetadata.concurrentAfterRead ??= { kept: true };
        if (metadataPatch.publicMetadata) user.publicMetadata = deepMerge(user.publicMetadata, metadataPatch.publicMetadata as Record<string, unknown>);
      },
    } },
  };
}

for (const variant of ["web", "mobile"] as const) {
  test(`${variant} official join saves bounded participation to public metadata only`, async () => {
    const { client, writes } = fakeClient();
    const quest = participantQuest(true);
    if (variant === "web") {
      await saveWebJoinedQuest(client as never, { authenticatedUserId: "joiner", hostUserId: "official-sqc", joinedQuest: quest });
    } else {
      assert.equal(await saveMobileGroupQuest(client as never, "official-sqc", quest, "joiner"), null);
    }

    assert.equal(writes.length, 1);
    assert.equal(writes[0].userId, "joiner");
    assert.equal("privateMetadata" in writes[0].metadata, false);
    const publicMetadata = writes[0].metadata.publicMetadata as Record<string, unknown>;
    assert.equal("theme" in publicMetadata, false, "official writes must not spread stale metadata snapshots");
    assert.deepEqual(Object.keys(publicMetadata), [OFFICIAL_GROUP_QUEST_METADATA_KEY]);
    assert.equal(Array.isArray(publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY]), false);
    assert.equal(quest.id in (publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, unknown>), true);
    assert.equal("unsafeMetadata" in writes[0].metadata, false);
  });

  test(`${variant} community join remains in host private metadata`, async () => {
    const { client, writes } = fakeClient();
    const quest = participantQuest(false);
    if (variant === "web") {
      await saveWebJoinedQuest(client as never, { authenticatedUserId: "joiner", hostUserId: "community-host", joinedQuest: quest });
    } else {
      assert.equal(await saveMobileGroupQuest(client as never, "community-host", quest, "joiner"), null);
    }

    assert.equal(writes.length, 1);
    assert.equal(writes[0].userId, "community-host");
    assert.equal("publicMetadata" in writes[0].metadata, false);
    const privateMetadata = writes[0].metadata.privateMetadata as Record<string, unknown>;
    assert.equal(privateMetadata.hostSecret, "keep");
    assert.equal(Array.isArray(privateMetadata.sqcGroupQuests), true);
  });
}

for (const variant of ["web", "mobile"] as const) {
  test(`${variant} official leave writes a tombstone that suppresses a legacy private copy`, async () => {
    const quest = participantQuest(true);
    const { client, user, writes } = statefulClient({}, { sqcGroupQuests: [structuredClone(quest)] });

    if (variant === "web") await saveWebOfficialQuestLeave(client as never, "joiner", quest.id);
    else assert.equal(await saveMobileGroupQuest(client as never, "official-sqc", { ...quest, participants: [] }, "joiner", { removeParticipant: true }), null);

    const officialPatch = (writes[0].publicMetadata as Record<string, unknown>)[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, unknown>;
    assert.deepEqual(officialPatch[quest.id], { active: false });
    assert.equal(Boolean((await findGroupQuestById(client as never, quest.id))?.groupQuest.participants.some(({ userId }) => userId === "joiner")), false);
    assert.equal(Boolean((await listPublicGroupQuests(client as never)).find(({ id }) => id === quest.id)?.participants.some(({ userId }) => userId === "joiner")), false);
    assert.equal((await listUserRelatedGroupQuests(client as never, "joiner")).some(({ id }) => id === quest.id), false);

    if (variant === "web") await saveWebJoinedQuest(client as never, { authenticatedUserId: "joiner", hostUserId: "official-sqc", joinedQuest: quest });
    else assert.equal(await saveMobileGroupQuest(client as never, "official-sqc", quest, "joiner"), null);
    const stored = (user.publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, Record<string, unknown>>)[quest.id];
    assert.equal(stored.active, true, "rejoin replaces the tombstone state");
    assert.equal((await listUserRelatedGroupQuests(client as never, "joiner")).some(({ id }) => id === quest.id), true);
  });
}

test("overlapping official quest patches preserve both participations and unrelated metadata", async () => {
  const first = participantQuest(true);
  const second = getBuiltInOfficialGroupQuests(new Date("2026-07-06T12:00:00.000Z"))[1];
  second.participants = structuredClone(first.participants);
  const { client, user } = statefulClient({ unrelated: { concurrent: "kept" } }, {});

  await Promise.all([
    saveWebJoinedQuest(client as never, { authenticatedUserId: "joiner", hostUserId: "official-sqc", joinedQuest: first }),
    saveWebJoinedQuest(client as never, { authenticatedUserId: "joiner", hostUserId: "official-sqc", joinedQuest: second }),
  ]);

  assert.equal((user.publicMetadata.unrelated as Record<string, unknown>).concurrent, "kept");
  assert.equal((user.publicMetadata.concurrentAfterRead as Record<string, unknown>).kept, true, "field changed after the read survives patch writes");
  assert.deepEqual(Object.keys(user.publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY] as Record<string, unknown>).sort(), [first.id, second.id].sort());
});
