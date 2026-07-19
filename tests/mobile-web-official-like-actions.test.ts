import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MobileSoloSideQuestsScreen } from "../src/components/mobile-app-web-shell";
import OfficialSoloLikeControl from "../src/components/official-solo-like-control";
import { CHALLENGES } from "../src/lib/challenges";

const challenge = CHALLENGES[0];

test("signed-in official Solo catalog rows keep a full-row quest link beside the Android like pill", () => {
  assert.ok(challenge);

  const html = renderToStaticMarkup(React.createElement(MobileSoloSideQuestsScreen, {
    challenges: [challenge],
    signedIn: true,
    likeSummaries: {
      [challenge.id]: { count: 4, likedByViewer: false },
    },
  }));

  assert.match(html, new RegExp(`<a class="sqc-app-row-main" aria-label="Open ${challenge.title}" href="/challenges/${challenge.id}"></a>`));
  assert.match(html, /<button[^>]*class="sqc-like-pill"[^>]*aria-pressed="false"/);
  assert.match(html, /<span class="sqc-like-pill-icon" data-icon="thumb-up-outline"/);
  assert.match(html, />4<\/span><\/button>/);
  assert.doesNotMatch(html, /👍/);
});

test("official Solo catalog preserves Android difficulty-first ordering across active and completed states", () => {
  assert.ok(challenge);

  const easyCompleted = { ...challenge, id: "easy-completed", title: "Easy completed", difficulty: "Easy" as const };
  const mediumAvailable = { ...challenge, id: "medium-available", title: "Medium available", difficulty: "Medium" as const };
  const hardActive = { ...challenge, id: "hard-active", title: "Hard active", difficulty: "Hard" as const };
  const html = renderToStaticMarkup(React.createElement(MobileSoloSideQuestsScreen, {
    challenges: [hardActive, mediumAvailable, easyCompleted],
    activeChallengeId: hardActive.id,
    completedChallengeIds: [easyCompleted.id],
  }));

  const easyIndex = html.indexOf(`/challenges/${easyCompleted.id}`);
  const mediumIndex = html.indexOf(`/challenges/${mediumAvailable.id}`);
  const hardIndex = html.indexOf(`/challenges/${hardActive.id}`);
  assert.ok(easyIndex >= 0 && mediumIndex >= 0 && hardIndex >= 0);
  assert.ok(easyIndex < mediumIndex && mediumIndex < hardIndex, "difficulty must sort before active/completed status like Android v338");
});

test("signed-out official Solo likes preserve the exact detail sign-in return path", () => {
  const html = renderToStaticMarkup(React.createElement(OfficialSoloLikeControl, {
    targetId: "queen & rook",
    count: 2,
    likedByViewer: false,
    signedIn: false,
    returnTo: "/challenges/queen%20%26%20rook",
    label: "Queen & Rook",
  }));

  assert.match(html, /href="\/sign-in\?redirect_url=%2Fchallenges%2Fqueen%2520%2526%2520rook"/);
  assert.match(html, /aria-label="Sign in to like Queen &amp; Rook\. 2 likes\."/);
  assert.doesNotMatch(html, /<button/);
});

test("official Solo like control disables repeated submissions and sends only the exact quest mutation", async () => {
  const source = await readFile(new URL("../src/components/official-solo-like-control.tsx", import.meta.url), "utf8");

  assert.match(source, /disabled=\{busy\}/);
  assert.match(source, /if \(busy\) return/);
  assert.match(source, /fetch\("\/api\/community-likes"/);
  assert.match(source, /targetType = "solo"/);
  assert.match(source, /targetType,/);
  assert.match(source, /targetId,/);
  assert.doesNotMatch(source, /userId|ownerId|username/);
  assert.match(source, /setLiked\(previous\.liked\)/);
  assert.match(source, /Could not update your like\. Try again\./);
});

test("official Solo detail loads public like totals for signed-out viewers", async () => {
  const source = await readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8");

  assert.match(source, /getCommunityLikeSummaries\(await clerkClient\(\), user\?\.id \?\? null\)/);
  assert.doesNotMatch(source, /const likeSummary = user\s*\?/);
});

test("official Solo detail keeps the Android like pill adjacent to both active and available titles", async () => {
  const source = await readFile(new URL("../src/app/challenges/[id]/page.tsx", import.meta.url), "utf8");

  assert.match(source, /import OfficialSoloLikeControl from "@\/components\/official-solo-like-control"/);
  assert.match(source, /className="sqc-active-detail-title-row"[\s\S]*<h1>\{challenge\.title\}<\/h1>[\s\S]*<OfficialSoloLikeControl/);
  assert.match(source, /className="sqc-official-title-row"[\s\S]*<h1>\{challenge\.title\}<\/h1>[\s\S]*<OfficialSoloLikeControl/);
  assert.match(source, /returnTo=\{`\/challenges\/\$\{encodeURIComponent\(challenge\.id\)\}`\}/);
});
