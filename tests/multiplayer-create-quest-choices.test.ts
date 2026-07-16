import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileMultiplayerCreateForm from "../src/components/mobile-multiplayer-create-form";
import { buildMultiplayerCreateQuestChoices, loadMultiplayerCreateQuestChoices } from "../src/lib/multiplayer-create-quest-choices";

const official = [{ id: "official-1", title: "Official Fork", objective: "Win a fork." }];
const owned = [
  { id: "owned-published", title: "My Published Quest", summary: "Keep the queen home.", config: "{}", lifecycle: "published" as const, visibility: "private" as const, createdAt: "", updatedAt: "" },
  { id: "owned-draft", title: "My Draft", summary: "Not ready.", config: "{}", lifecycle: "draft" as const, visibility: "private" as const, createdAt: "", updatedAt: "" },
];
const community = [
  { id: "community-1", title: "Community Knight", summary: "Move both knights.", config: "{}", lifecycle: "published" as const, visibility: "public" as const, createdAt: "", updatedAt: "", creatorName: "Ada" },
  { id: "owned-published", title: "Stale public copy", summary: "Should lose to owner copy.", config: "{}", lifecycle: "published" as const, visibility: "public" as const, createdAt: "", updatedAt: "", creatorName: "Ada" },
];

test("multiplayer create choices include official, published owned, and public community quests with provenance", () => {
  assert.deepEqual(buildMultiplayerCreateQuestChoices({ official, owned, community }), [
    { id: "official-1", title: "Official Fork", summary: "Win a fork.", source: "official", sourceLabel: "SQC Official" },
    { id: "owned-published", title: "My Published Quest", summary: "Keep the queen home.", source: "custom", sourceLabel: "Your private" },
    { id: "community-1", title: "Community Knight", summary: "Move both knights.", source: "community", sourceLabel: "Community · Ada" },
  ]);
});

test("published owner records win duplicate IDs across every source", () => {
  const choices = buildMultiplayerCreateQuestChoices({
    official: [...official, { id: "owned-published", title: "Official collision", objective: "Old official copy." }],
    owned,
    community,
  });

  assert.deepEqual(choices.filter((quest) => quest.id === "owned-published"), [
    { id: "owned-published", title: "My Published Quest", summary: "Keep the queen home.", source: "custom", sourceLabel: "Your private" },
  ]);
});

test("community choice failure keeps official and owned choices available with an explicit notice", async () => {
  const result = await loadMultiplayerCreateQuestChoices({
    official,
    owned,
    loadCommunity: async () => { throw new Error("provider unavailable"); },
  });

  assert.deepEqual(result.choices.map((quest) => quest.id), ["official-1", "owned-published"]);
  assert.equal(result.communityUnavailable, true);
});

test("multiplayer create form renders each quest source instead of collapsing provenance", () => {
  const choices = buildMultiplayerCreateQuestChoices({ official, owned, community });
  const html = renderToStaticMarkup(
    createElement(MobileMultiplayerCreateForm, { signedIn: true, quests: choices, stableNow: "2026-07-17T12:00:00.000Z" }),
  );

  assert.match(html, /class="sqc-option-card-copy"/);
  assert.match(html, /class="sqc-option-source"/);
  assert.match(html, />SQC Official</);
  assert.match(html, />Your private</);
  assert.match(html, />Community · Ada</);
});

test("multiplayer create form shows when optional community choices are unavailable", () => {
  const html = renderToStaticMarkup(
    createElement(MobileMultiplayerCreateForm, {
      signedIn: true,
      quests: buildMultiplayerCreateQuestChoices({ official, owned, community: [] }),
      stableNow: "2026-07-17T12:00:00.000Z",
      communityUnavailable: true,
    }),
  );

  assert.match(html, /Community Side Quests could not load/);
  assert.match(html, /Official and your own published Side Quests are still available/);
});

test("multiplayer create page loads owned and public community choices for the authenticated builder", async () => {
  const source = await readFile(new URL("../src/app/create-multiplayer-side-quest/page.tsx", import.meta.url), "utf8");

  assert.match(source, /getCustomSideQuests/);
  assert.match(source, /listPublicCommunitySideQuests/);
  assert.match(source, /loadMultiplayerCreateQuestChoices/);
  assert.match(source, /privateMetadata/);
});
