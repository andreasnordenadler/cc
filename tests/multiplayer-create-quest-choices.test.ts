import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileMultiplayerCreateForm from "../src/components/mobile-multiplayer-create-form";
import { buildMultiplayerCreateQuestChoices, getMultiplayerCreateQuestPicker, loadMultiplayerCreateQuestChoices, selectCommunityCreateChoices, toggleMultiplayerCreateQuest } from "../src/lib/multiplayer-create-quest-choices";

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

test("requested community quest remains available beyond the bounded browse window", () => {
  const quests = Array.from({ length: 100 }, (_, index) => ({ ...community[0], id: `community-${index + 1}` }));

  const selected = selectCommunityCreateChoices(quests, "community-100", 80);

  assert.equal(selected.length, 81);
  assert.equal(selected.at(-1)?.id, "community-100");
  assert.equal(new Set(selected.map((quest) => quest.id)).size, selected.length);
  assert.equal(selectCommunityCreateChoices(quests, "community-1", 80).length, 80);
});

test("multiplayer create form defaults to Android's first three official Side Quests", () => {
  const choices = buildMultiplayerCreateQuestChoices({
    official: [
      ...official,
      { id: "official-2", title: "Official Pin", objective: "Win a pin." },
      { id: "official-3", title: "Official Skewer", objective: "Win a skewer." },
      { id: "official-4", title: "Official Mate", objective: "Deliver mate." },
    ],
    owned,
    community,
  });

  const html = renderToStaticMarkup(
    createElement(MobileMultiplayerCreateForm, { signedIn: true, quests: choices, stableNow: "2026-07-17T12:00:00.000Z" }),
  );

  assert.match(html, />3\/4 Side Quests selected<\/small>/);
  assert.match(html, /aria-label="Remove Official Fork from Multiplayer Side Quest"/);
  assert.match(html, /aria-label="Remove Official Pin from Multiplayer Side Quest"/);
  assert.match(html, /aria-label="Remove Official Skewer from Multiplayer Side Quest"/);
  assert.doesNotMatch(html, /aria-label="Remove Official Mate from Multiplayer Side Quest"/);
});

test("multiplayer create form matches Android's persistent draft summary footer", () => {
  const choices = buildMultiplayerCreateQuestChoices({
    official: [
      ...official,
      { id: "official-2", title: "Official Pin", objective: "Win a pin." },
      { id: "official-3", title: "Official Skewer", objective: "Win a skewer." },
    ],
    owned,
    community,
  });

  const html = renderToStaticMarkup(
    createElement(MobileMultiplayerCreateForm, { signedIn: true, quests: choices, stableNow: "2026-07-17T12:00:00.000Z" }),
  );

  assert.match(html, /class="sqc-create-footer-bar"/);
  assert.match(html, /class="sqc-create-footer-title">3\/4 selected<\/strong>/);
  assert.match(html, /class="sqc-create-footer-meta">Name the Multiplayer Side Quest before creating\.<\/span>/);
  assert.match(html, /aria-label="Create Multiplayer Side Quest now"[^>]*>Create<\/button>/);
});

test("multiplayer create form renders each quest source instead of collapsing provenance", () => {
  const choices = buildMultiplayerCreateQuestChoices({ official, owned, community });
  const html = renderToStaticMarkup(
    createElement(MobileMultiplayerCreateForm, { signedIn: true, quests: choices, stableNow: "2026-07-17T12:00:00.000Z" }),
  );

  assert.match(html, /class="sqc-option-card-copy"/);
  assert.match(html, /class="sqc-option-source"/);
  assert.match(html, />SQC Official</);
  assert.match(html, />Official \(1\)</);
  assert.match(html, />Community \(2\)</);
  assert.match(html, /aria-pressed="true"[^>]*>Browse</);
  assert.match(html, /aria-pressed="false"[^>]*>Selected \(1\)</);
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

test("multiplayer create form opens with the exact canonical community quest preselected", () => {
  const communityChoices = Array.from({ length: 10 }, (_, index) => ({ ...community[0], id: `community-${index + 1}`, title: `Community Knight ${index + 1}` }));
  const choices = buildMultiplayerCreateQuestChoices({ official, owned, community: communityChoices });
  const html = renderToStaticMarkup(
    createElement(MobileMultiplayerCreateForm, {
      signedIn: true,
      quests: choices,
      stableNow: "2026-07-17T12:00:00.000Z",
      initialQuestId: "community-10",
    }),
  );

  assert.match(html, />Community \(11\)<\/button>/);
  assert.match(html, /aria-pressed="true"[^>]*>Community \(11\)<\/button>/);
  assert.doesNotMatch(html, /role="tablist"|role="tab"|aria-selected=/);
  assert.match(html, /aria-pressed="false"[^>]*>Browse<\/button>/);
  assert.match(html, /aria-pressed="true"[^>]*>Selected \(1\)<\/button>/);
  assert.match(html, />1\/4 Side Quests selected<\/small>/);
  assert.match(html, /aria-label="Remove Community Knight 10 from Multiplayer Side Quest" class="sqc-create-selected-row"/);
  assert.match(html, /class="sqc-option-card selected"[^>]*>[\s\S]*?Community Knight 10[\s\S]*?<b>Remove<\/b>/);
});

test("multiplayer create page loads owned and public community choices for the authenticated builder", async () => {
  const source = await readFile(new URL("../src/app/create-multiplayer-side-quest/page.tsx", import.meta.url), "utf8");

  assert.match(source, /getCustomSideQuests/);
  assert.match(source, /listPublicCommunitySideQuests/);
  assert.match(source, /selectCommunityCreateChoices/);
  assert.match(source, /listPublicCommunitySideQuests\(await clerkClient\(\), \{ limit: null \}\)/);
  assert.match(source, /loadMultiplayerCreateQuestChoices/);
  assert.match(source, /privateMetadata/);
  assert.match(source, /const \{ quest \} = await searchParams/);
  assert.match(source, /initialQuestId=\{typeof quest === "string" \? quest : undefined\}/);
});

test("multiplayer create picker matches Android source, selected, search, and paging filters", () => {
  const choices = buildMultiplayerCreateQuestChoices({ official, owned, community });

  assert.deepEqual(getMultiplayerCreateQuestPicker({
    choices,
    source: "community",
    selectedIds: ["owned-published", "community-1"],
    selectedOnly: true,
    search: "knight",
    limit: 1,
  }), {
    visible: [{ id: "community-1", title: "Community Knight", summary: "Move both knights.", source: "community", sourceLabel: "Community · Ada" }],
    hiddenCount: 0,
    officialCount: 1,
    communityCount: 2,
  });

  const paged = getMultiplayerCreateQuestPicker({
    choices: [
      ...choices,
      { id: "official-2", title: "Second", summary: "Second quest", source: "official", sourceLabel: "SQC Official" },
    ],
    source: "official",
    selectedIds: [],
    selectedOnly: false,
    search: "",
    limit: 1,
  });
  assert.equal(paged.visible.length, 1);
  assert.equal(paged.hiddenCount, 1);
});

test("multiplayer create picker explains the four-quest limit and permits removal", () => {
  assert.deepEqual(toggleMultiplayerCreateQuest(["one", "two", "three", "four"], "five"), {
    selectedIds: ["one", "two", "three", "four"],
    error: "Choose up to 4 Side Quests. Remove one before adding another.",
  });
  assert.deepEqual(toggleMultiplayerCreateQuest(["one", "two"], "two"), {
    selectedIds: ["one"],
    error: null,
  });
});
