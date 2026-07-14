import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  loadMobilePublicMultiplayerCatalog,
  type PublicMultiplayerQuestSource,
} from "../src/lib/mobile-public-multiplayer";
import {
  findSignedOutPublicMultiplayerQuest,
  getSignedOutPublicMultiplayerCatalog,
} from "../apps/mobile/src/multiplayer/publicCatalog";

function publicQuest(overrides: Partial<PublicMultiplayerQuestSource> = {}): PublicMultiplayerQuestSource {
  return {
    id: "official-real-quest",
    name: "Real public quest",
    official: true,
    inviteMode: "public",
    inviteCopy: "Join the real table.",
    providerMode: "both",
    providerLabel: "Lichess or Chess.com",
    startAt: "2026-07-13T10:00:00.000Z",
    endAt: "2026-07-14T10:00:00.000Z",
    rules: { timeControl: "Rapid", rated: "Rated", color: "Any color" },
    questIds: ["knights-before-coffee"],
    customQuestSnapshots: [],
    participants: [
      {
        userId: "private-user-id",
        username: "private-provider-name",
        leaderboardName: "Private Player",
        provider: "lichess",
        joinedAt: "2026-07-13T10:00:00.000Z",
        completedQuestIds: ["knights-before-coffee"],
      },
    ],
    ...overrides,
  };
}

test("signed-out mobile catalog exposes populated real public quest records without participant identities or progress", async () => {
  const catalog = await loadMobilePublicMultiplayerCatalog({
    baseUrl: "https://sqc.test",
    now: new Date("2026-07-13T12:00:00.000Z"),
    listPublicGroupQuests: async () => [
      publicQuest(),
      publicQuest({ id: "community-real-quest", name: "Community real quest", official: false }),
    ],
  });

  assert.equal(catalog.status, "available");
  assert.deepEqual(catalog.officialGroupQuests.map((quest) => quest.id), ["official-real-quest"]);
  assert.deepEqual(catalog.communityGroupQuests.map((quest) => quest.id), ["community-real-quest"]);
  const official = catalog.officialGroupQuests[0];
  assert.equal(official.playersLabel, "1 player");
  assert.equal(official.timeLeftLabel, "22h left");
  assert.equal(official.status, "Live");
  assert.equal(official.joinState, "Join");
  assert.equal(official.href, "https://sqc.test/groupquests/official-real-quest");
  assert.equal(official.leaderboardRows, undefined);
  assert.equal(official.progressLabel, undefined);
  assert.equal(official.verifiedLabel, undefined);
  assert.equal(JSON.stringify(official).includes("private-user-id"), false);
  assert.equal(JSON.stringify(official).includes("private-provider-name"), false);
  assert.equal(JSON.stringify(official).includes("Private Player"), false);

  const mobileCatalog = getSignedOutPublicMultiplayerCatalog({ multiplayerCatalog: catalog });
  assert.deepEqual(mobileCatalog.official.map((quest) => quest.id), ["official-real-quest"]);
  assert.deepEqual(mobileCatalog.community.map((quest) => quest.id), ["community-real-quest"]);
  assert.equal(findSignedOutPublicMultiplayerQuest(mobileCatalog.official, "official-real-quest")?.title, "Real public quest");
  assert.equal(findSignedOutPublicMultiplayerQuest(mobileCatalog.official, "official-preview-knights"), null);
  assert.equal(findSignedOutPublicMultiplayerQuest(mobileCatalog.official, "nonexistent-fixture-id"), null);
});

test("signed-out mobile catalog renders an honest empty state when no public quests exist", async () => {
  const catalog = await loadMobilePublicMultiplayerCatalog({
    baseUrl: "https://sqc.test",
    listPublicGroupQuests: async () => [],
  });

  assert.deepEqual(catalog, {
    status: "available",
    officialGroupQuests: [],
    communityGroupQuests: [],
  });
  assert.deepEqual(getSignedOutPublicMultiplayerCatalog({ multiplayerCatalog: catalog }), {
    status: "available",
    official: [],
    community: [],
  });
});

test("signed-out mobile catalog distinguishes public fetch failure from a real empty catalog", async () => {
  const warnings: Array<[string, { reason: string }]> = [];
  const catalog = await loadMobilePublicMultiplayerCatalog({
    baseUrl: "https://sqc.test",
    listPublicGroupQuests: async () => { throw new Error("provider unavailable"); },
    warn: (message, context) => warnings.push([message, context]),
  });

  assert.deepEqual(catalog, {
    status: "unavailable",
    officialGroupQuests: [],
    communityGroupQuests: [],
  });
  assert.deepEqual(warnings, [["mobile public multiplayer catalog unavailable", { reason: "provider unavailable" }]]);
});

test("production bootstrap and Android screen use the public catalog seam and contain no signed-out preview fixtures", async () => {
  const [routeSource, appSource] = await Promise.all([
    readFile(new URL("../src/app/api/mobile/bootstrap/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(routeSource, /loadMobilePublicMultiplayerCatalog/);
  assert.match(routeSource, /multiplayerCatalog/);
  const signedOutScreenSource = appSource.slice(
    appSource.indexOf("function MultiplayerSideQuestsScreen"),
    appSource.indexOf("function OfficialMultiplayerLeaderboardsScreen"),
  );
  assert.match(appSource, /getSignedOutPublicMultiplayerCatalog\(bootstrap\)/);
  assert.match(signedOutScreenSource, /publicMultiplayerCatalog\.status === "unavailable"/);
  assert.doesNotMatch(appSource, /SIGNED_OUT_(OFFICIAL|COMMUNITY)_MULTIPLAYER_QUESTS/);
  assert.doesNotMatch(signedOutScreenSource, /(official|community)-preview-/);
  assert.doesNotMatch(signedOutScreenSource, /miragambit|jonforks|gretafork|sashaqueenless|nilsattack/);
});
