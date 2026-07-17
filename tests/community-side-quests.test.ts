import assert from "node:assert/strict";
import test from "node:test";

import { listPublicCommunitySideQuests } from "../src/lib/community-side-quests";

function questOwner(id: string, likes: unknown[] = [], customQuestId: string | null = id === "owner" ? "community-quest" : null) {
  return {
    id,
    firstName: id,
    lastName: null,
    username: id,
    primaryEmailAddress: null,
    publicMetadata: {},
    privateMetadata: {
      customSideQuests: customQuestId ? [{
        id: customQuestId,
        title: `Community Castle ${customQuestId}`,
        summary: "Win after completing the public castle rule.",
        config: JSON.stringify({ version: 1, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
        lifecycle: "published",
        visibility: "public",
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-16T00:00:00.000Z",
      }] : [],
      sqcCommunityLikes: likes,
    },
  };
}

test("Community catalog derives like count and viewer state from the same bounded user scan", async () => {
  let scans = 0;
  const users = [
    questOwner("owner"),
    questOwner("viewer", [{ targetType: "solo", targetId: "community-quest", likedAt: "2026-07-17T00:00:00.000Z" }]),
    questOwner("other", [{ targetType: "solo", targetId: "community-quest", likedAt: "2026-07-17T00:00:00.000Z" }]),
  ];
  const client = {
    users: {
      async getUserList({ offset = 0 }: { limit: number; offset?: number }) {
        scans += 1;
        return { data: offset === 0 ? users : [] };
      },
    },
  };

  const rows = await listPublicCommunitySideQuests(client, { viewerUserId: "viewer" });

  assert.equal(scans, 1);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0]?.likeSummary, { count: 2, likedByViewer: true });
});

test("Community catalog can return every public quest before client-side popularity sorting", async () => {
  const users = Array.from({ length: 81 }, (_, index) => questOwner(`owner-${index}`, [], `community-${index}`));
  const client = {
    users: {
      async getUserList({ offset = 0 }: { limit: number; offset?: number }) {
        return { data: offset === 0 ? users : [] };
      },
    },
  };

  const rows = await listPublicCommunitySideQuests(client, { limit: null });

  assert.equal(rows.length, 81);
});
