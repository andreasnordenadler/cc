import assert from "node:assert/strict";
import test from "node:test";

import { saveWebJoinedQuest } from "../src/app/api/groupquests/[id]/join/route";
import { saveMobileGroupQuest } from "../src/app/api/mobile/groupquests/[id]/route";
import { OFFICIAL_GROUP_QUEST_METADATA_KEY, buildGroupQuest, getBuiltInOfficialGroupQuests, type ServerGroupQuest } from "../src/lib/groupquests";

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
    assert.equal(publicMetadata.theme, "dark");
    assert.equal(Array.isArray(publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY]), true);
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
