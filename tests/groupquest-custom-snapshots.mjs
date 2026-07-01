import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildGroupQuest,
  getStoredGroupQuests,
  upsertHostGroupQuest,
} from "../src/lib/groupquests.ts";

const customRuleConfig = JSON.stringify({
  version: 2,
  logic: "all",
  blocks: [
    { type: "gameResult", result: "win" },
    {
      type: "pieceState",
      piece: "queen",
      owner: "my",
      condition: "gone",
      timing: { byMove: 20 },
    },
  ],
});

test("community custom snapshots survive Multiplayer storage compaction", () => {
  const groupQuest = buildGroupQuest({
    hostUserId: "host_community",
    hostName: "Community Host",
    name: "Community Recipe Stack",
    questIds: ["finish-any-game", "community-queen-sacrifice"],
    customQuestSnapshots: [
      {
        id: "community-queen-sacrifice",
        title: "Community Queen Sacrifice",
        summary: "Win after giving up the queen by move 20.",
        config: customRuleConfig,
        badgeImageUrl: "/badges/custom/community/community-coat-12.png",
        reward: 175,
      },
    ],
    startAt: "2026-07-01T12:00:00.000Z",
    endAt: "2026-07-08T12:00:00.000Z",
  });

  const [stored] = getStoredGroupQuests({ sqcGroupQuests: upsertHostGroupQuest({}, groupQuest) });

  assert.ok(stored);
  assert.deepEqual(stored.questIds, ["finish-any-game", "community-queen-sacrifice"]);
  assert.equal(stored.customQuestSnapshots?.[0]?.id, "community-queen-sacrifice");
  assert.equal(stored.customQuestSnapshots?.[0]?.title, "Community Queen Sacrifice");
  assert.equal(stored.customQuestSnapshots?.[0]?.summary, "Win after giving up the queen by move 20.");
  assert.equal(stored.customQuestSnapshots?.[0]?.config, customRuleConfig);
  assert.equal(stored.customQuestSnapshots?.[0]?.badgeImageUrl, "/badges/custom/community/community-coat-12.png");
  assert.equal(stored.customQuestSnapshots?.[0]?.reward, 175);
});

test("legacy saved custom snapshots without optional fields still normalize", () => {
  const [stored] = getStoredGroupQuests({
    sqcGroupQuests: [
      {
        id: "legacy-custom-stack",
        hostUserId: "host_legacy",
        hostName: "Legacy Host",
        name: "Legacy Custom Stack",
        questIds: ["legacy-custom-rule"],
        providerMode: "both",
        startAt: "2026-06-01T12:00:00.000Z",
        endAt: "2026-06-08T12:00:00.000Z",
        createdAt: "2026-06-01T11:00:00.000Z",
        participants: [],
        customQuestSnapshots: [
          {
            id: "legacy-custom-rule",
            title: "Legacy Custom Rule",
            config: customRuleConfig,
          },
        ],
      },
    ],
  });

  assert.ok(stored);
  assert.equal(stored.customQuestSnapshots?.[0]?.summary, "Custom Side Quest rule");
  assert.equal(stored.customQuestSnapshots?.[0]?.badgeImageUrl, null);
  assert.equal(stored.customQuestSnapshots?.[0]?.reward, 100);
});
