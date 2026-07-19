import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import React from "react";
import { buildSoloCheckResult } from "../src/lib/solo-check-result";
import { buildMultiplayerCompletion } from "../src/lib/multiplayer-completion-celebration";
import { SoloCompletionCelebration } from "../src/components/solo-completion-celebration";

test("a newly passed Solo proof returns and renders the Android v338 completion celebration", () => {
  const result = buildSoloCheckResult({
    challenge: {
      id: "back-rank-goblin",
      title: "Back-Rank Goblin",
      badgeName: "Rank Goblin",
      badgeImage: "/badges/v7/coming-soon-clean/back-rank-goblin-badge.png",
      unlockCopy: "Win by making the back rank feel like a locked broom closet.",
      accentColor: "#f5c86a",
    },
    passed: true,
    alreadyCompleted: false,
  });

  assert.equal(result.status, "completed");
  const html = renderToStaticMarkup(React.createElement(SoloCompletionCelebration, {
    completion: result.completion,
    onClose: () => undefined,
  }));

  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, />Proof accepted</);
  assert.match(html, />Quest completed</);
  assert.match(html, />Coat of Arms unlocked\.</);
  assert.match(html, /Back-Rank Goblin/);
  assert.match(html, /Coat of Arms: Rank Goblin/);
  assert.match(html, /Win by making the back rank feel like a locked broom closet\./);
  assert.match(html, /back-rank-goblin-badge\.png/);
  assert.match(html, /quest-complete-red-wax-sqc-v3\.png/);
  assert.match(html, /Close celebration/);
});

test("the production Home refresh shows celebration only from a newly completed server-derived result", async () => {
  const [actionSource, controlSource] = await Promise.all([
    readFile(new URL("../src/app/actions.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/active-solo-actions.tsx", import.meta.url), "utf8"),
  ]);

  const actionBody = actionSource.slice(actionSource.indexOf("async function runActiveChallengeCheck"));
  assert.match(actionBody, /buildSoloCheckResult/);
  assert.match(actionBody, /alreadyCompleted:\s*progress\.completedChallengeIds\.includes\(challenge\.id\)/);
  assert.match(controlSource, /useActionState\(checkActiveChallengeWithResult/);
  assert.match(controlSource, /state\.status === "completed"/);
  assert.match(controlSource, /<SoloCompletionCelebration/);
  const celebrationSource = await readFile(new URL("../src/components/solo-completion-celebration.tsx", import.meta.url), "utf8");
  assert.match(celebrationSource, /event\.key === "Escape"/);
  assert.match(celebrationSource, /autoFocus/);
});

test("completion celebration fills the viewport, layers the Android coat and seal, and respects reduced motion", async () => {
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(css, /\.sqc-celebration-backdrop\s*\{[\s\S]*position:\s*fixed;[\s\S]*inset:\s*0;/);
  assert.match(css, /\.sqc-celebration-card\s*\{[^}]*box-sizing:\s*border-box;/);
  assert.match(css, /\.sqc-celebration-coat-frame\s*\{[\s\S]*position:\s*relative;[\s\S]*aspect-ratio:\s*1/);
  assert.match(css, /\.sqc-celebration-seal\s*\{[\s\S]*position:\s*absolute;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.sqc-celebration-particles/);
});

test("a server-reported Multiplayer completion renders the Android v338 Multiplayer celebration state", () => {
  const built = buildMultiplayerCompletion({
    newlyPassedQuestIds: ["new-quest", "another-new-quest"],
    questDetails: [{
      id: "new-quest",
      title: "Knights Before Coffee",
      summary: "Move only knights first.",
      imageUrl: "/badges/knights-before-coffee.png",
      glowColor: "#83d8ad",
      ruleLines: [],
    }],
  });

  assert.ok(built);
  assert.equal(built.extraCompletedCount, 1);
  const html = renderToStaticMarkup(React.createElement(SoloCompletionCelebration, {
    completion: built.completion,
    mode: "multiplayer",
    extraCompletedCount: built.extraCompletedCount,
    onClose: () => undefined,
  }));

  assert.match(html, />Multiplayer proof accepted</);
  assert.match(html, />Quest completed in Multiplayer</);
  assert.match(html, />Solo Side Quest completion recorded too\.</);
  assert.match(html, /Knights Before Coffee/);
  assert.match(html, /\+1 more Side Quest completed in this refresh\./);
});

test("Multiplayer completion accepts the legacy leaderboard quest summary call-site", () => {
  const built = buildMultiplayerCompletion({
    newlyPassedQuestIds: ["legacy-quest"],
    questDetails: [{
      id: "legacy-quest",
      title: "Legacy Quest",
      badgeImage: "/badges/legacy.png",
      badgeName: "Legacy Crest",
    }],
  });

  assert.ok(built);
  assert.equal(built.completion.badgeImage, "/badges/legacy.png");
  assert.equal(built.completion.badgeName, "Legacy Crest");
});

test("Multiplayer completion ignores IDs that were not returned by the refresh route", () => {
  assert.equal(buildMultiplayerCompletion({
    newlyPassedQuestIds: ["unknown-id"],
    questDetails: [{ id: "known-id", title: "Known", summary: "Known", ruleLines: [] }],
  }), null);
});
