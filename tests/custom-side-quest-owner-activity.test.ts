import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

import CustomSideQuestActivity from "../src/components/custom-side-quest-activity";
import { buildCustomQuestStats, buildOwnedCustomQuestStats, formatCustomQuestActivity, loadCustomQuestGroupContext } from "../src/lib/custom-side-quest-activity";

const attempts = [
  { challengeId: "custom-alpha" },
  { id: "custom-alpha:second-check" },
  { challengeId: "official-only" },
];

const relatedQuest = {
  id: "group-one",
  questIds: ["custom-alpha"],
  participants: [
    { userId: "one", completedQuestIds: ["custom-alpha"] },
    { userId: "two", completedQuestIds: [] },
  ],
};

const secondQuest = {
  id: "group-two",
  questIds: ["custom-alpha", "official-only"],
  participants: [
    { userId: "three", completedQuestIds: ["custom-alpha", "custom-alpha"] },
  ],
};

test("owned Custom activity matches Android v339 play and completion semantics", () => {
  const stats = buildCustomQuestStats({
    questId: "custom-alpha",
    attempts,
    completedChallengeIds: ["custom-alpha"],
    activeChallengeId: null,
    groupQuests: [relatedQuest, secondQuest],
  });

  assert.deepEqual(stats, {
    soloAttempts: 2,
    soloSelections: 0,
    soloCompletions: 1,
    multiplayerLineups: 2,
    multiplayerAttempts: 3,
    multiplayerFulfillments: 2,
  });
  assert.equal(formatCustomQuestActivity(stats), "4 plays · 3 completions");
});

test("owned Custom activity deduplicates replicated Multiplayer records by stable id", () => {
  const stats = buildCustomQuestStats({
    questId: "custom-alpha",
    attempts: [],
    completedChallengeIds: [],
    activeChallengeId: null,
    groupQuests: [relatedQuest, { ...relatedQuest }],
  });

  assert.equal(stats.multiplayerLineups, 1);
  assert.equal(stats.multiplayerAttempts, 2);
  assert.equal(stats.multiplayerFulfillments, 1);
});

test("owner activity panel renders the Android v339 detail copy for private draft quests", () => {
  const html = renderToStaticMarkup(createElement(CustomSideQuestActivity, {
    stats: {
      soloAttempts: 2,
      soloSelections: 0,
      soloCompletions: 1,
      multiplayerLineups: 3,
      multiplayerAttempts: 4,
      multiplayerFulfillments: 1,
    },
  }));

  assert.match(html, /Activity so far/);
  assert.match(html, /5 plays · 2 completions/);
  assert.match(html, /Stats show your activity with this Side Quest\./);
});

test("owned Custom activity matches Android v339's honest zero state", () => {
  assert.equal(formatCustomQuestActivity({
    soloAttempts: 0,
    soloSelections: 0,
    soloCompletions: 0,
    multiplayerLineups: 0,
    multiplayerAttempts: 0,
    multiplayerFulfillments: 0,
  }), "No plays yet.");
});

test("owner activity derives completion only from Android's public account progress", () => {
  const stats = buildOwnedCustomQuestStats({
    questId: "custom-alpha",
    publicMetadata: {
      challengeAttempts: [{ challengeId: "custom-alpha", summary: "Checked", checkedAt: "2026-07-29T00:00:00.000Z" }],
      challengeProgress: { completedChallengeIds: [] },
    },
    groupQuests: [],
  });

  assert.equal(stats.soloAttempts, 1);
  assert.equal(stats.soloCompletions, 0);
});

test("owner activity keeps the available Multiplayer context when either bounded scan fails", async () => {
  const context = await loadCustomQuestGroupContext({
    loadRelated: async () => { throw new Error("related unavailable"); },
    loadPublic: async () => [relatedQuest],
  });

  assert.deepEqual(context, [relatedQuest]);
  assert.deepEqual(await loadCustomQuestGroupContext({
    loadRelated: async () => { throw new Error("related unavailable"); },
    loadPublic: async () => { throw new Error("public unavailable"); },
  }), []);
});

test("authenticated owner detail wires server-derived activity into every lifecycle and visibility state", async () => {
  const source = await readFile(new URL("../src/app/custom-side-quests/[id]/page.tsx", import.meta.url), "utf8");

  assert.match(source, /buildOwnedCustomQuestStats/);
  assert.match(source, /<CustomSideQuestActivity stats=\{stats\}/);
  assert.doesNotMatch(source, /quest\.visibility === "public"[^\n]*CustomSideQuestActivity/);
  assert.doesNotMatch(source, /quest\.lifecycle === "published"[^\n]*CustomSideQuestActivity/);
});
