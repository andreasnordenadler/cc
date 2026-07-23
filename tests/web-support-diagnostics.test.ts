import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileSupportScreen } from "../src/components/mobile-app-web-shell";
import { buildCommunitySoloReportContext, buildSupportReportContext, buildWebSupportAccountContext, buildWebSupportDiagnostics, loadWebSupportGroupQuestContext } from "../src/lib/web-support-diagnostics";
import { buildGroupQuest } from "../src/lib/groupquests";

test("Community Solo support handoff accepts only bounded public display context", () => {
  assert.deepEqual(buildCommunitySoloReportContext({
    report: "community-solo",
    questId: "quest/42",
    title: "Ada's   Fork & Pin",
    creator: "Ada & Lin",
  }), {
    type: "community-solo",
    questId: "quest/42",
    title: "Ada's   Fork & Pin",
    creatorName: "Ada & Lin",
    initialMessage: "Report Community Solo Side Quest\nTitle: Ada's   Fork & Pin\nID: quest/42\nCreator: Ada & Lin\nIssue: ",
    returnPath: "/support?report=community-solo&questId=quest%2F42&title=Ada%27s+++Fork+%26+Pin&creator=Ada+%26+Lin",
  });
  assert.equal(buildCommunitySoloReportContext({ report: "multiplayer", questId: "quest/42", title: "Fork", creator: "Ada" }), null);
  assert.equal(buildCommunitySoloReportContext({ report: "community-solo", questId: "", title: "Fork", creator: "Ada" }), null);
  assert.equal(buildCommunitySoloReportContext({ report: "community-solo", questId: ["quest/42"], title: "Fork", creator: "Ada" }), null);
  assert.equal(buildCommunitySoloReportContext({ report: "community-solo", questId: "q".repeat(161), title: "Fork", creator: "Ada" }), null);
  assert.equal(buildCommunitySoloReportContext({ report: "community-solo", questId: "quest/42", title: "x".repeat(161), creator: "Ada" }), null);
});

test("Community Multiplayer support handoff matches Android's bounded public report context", () => {
  assert.deepEqual(buildSupportReportContext({
    report: "community-multiplayer",
    questId: "community/table-42",
    title: "Ada's Fork Table",
    host: "Ada & Lin",
    status: "Open",
  }), {
    type: "community-multiplayer",
    questId: "community/table-42",
    title: "Ada's Fork Table",
    hostName: "Ada & Lin",
    status: "Open",
    initialMessage: "Report Community Multiplayer Side Quest\nQuest: Ada's Fork Table\nQuest ID: community/table-42\nHost: Ada & Lin\nStatus: Open\nIssue: ",
    returnPath: "/support?report=community-multiplayer&questId=community%2Ftable-42&title=Ada%27s+Fork+Table&host=Ada+%26+Lin&status=Open",
  });
  assert.equal(buildSupportReportContext({ report: "community-multiplayer", questId: ["community/table-42"], title: "Table", host: "Ada", status: "Open" }), null);
  assert.equal(buildSupportReportContext({ report: "community-multiplayer", questId: "q".repeat(161), title: "Table", host: "Ada", status: "Open" }), null);
  assert.equal(buildSupportReportContext({ report: "community-multiplayer", questId: "table", title: "x".repeat(161), host: "Ada", status: "Open" }), null);
  assert.equal(buildSupportReportContext({ report: "community-multiplayer", questId: "table", title: "Table", host: "Ada\nInjected", status: "Open" }), null);
});

test("support route normalizes report search parameters and passes them into the production screen", () => {
  const source = readFileSync(new URL("../src/app/support/page.tsx", import.meta.url), "utf8");

  assert.match(source, /SupportPage\(\{\s*searchParams,\s*\}/);
  assert.match(source, /buildSupportReportContext\(await searchParams\)/);
  assert.match(source, /reportContext=\{reportContext\}/);
});

test("support composer remounts when the exact report context changes", () => {
  const source = readFileSync(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8");

  assert.match(source, /<MobileSupportComposer\s+key=\{reportContext\?\.returnPath \?\? "support"\}/);
});

test("signed-in support prefills the exact Community Solo report for account-attached submission", () => {
  const html = renderToStaticMarkup(React.createElement(MobileSupportScreen, {
    signedIn: true,
    reportContext: buildCommunitySoloReportContext({
      report: "community-solo",
      questId: "quest/42",
      title: "Ada's Fork",
      creator: "Ada",
    }),
  }));

  assert.match(html, /<textarea[^>]*>Report Community Solo Side Quest\nTitle: Ada&#x27;s Fork\nID: quest\/42\nCreator: Ada\nIssue: <\/textarea>/);
  assert.match(html, />Send support message<\/button>/);
});

test("signed-out support renders the bounded Community Solo report context before sign-in", () => {
  const html = renderToStaticMarkup(React.createElement(MobileSupportScreen, {
    signedIn: false,
    reportContext: {
      type: "community-solo",
      questId: "quest/42",
      title: "Ada's Fork & Pin",
      creatorName: "Ada & Lin",
      initialMessage: "Report Community Solo Side Quest\nTitle: Ada's Fork & Pin\nID: quest/42\nCreator: Ada & Lin\nIssue: ",
      returnPath: "/support?report=community-solo&questId=quest%2F42&title=Ada%27s+Fork+%26+Pin&creator=Ada+%26+Lin",
    },
  }));

  assert.match(html, /Report Community Solo Side Quest/);
  assert.match(html, /Ada&#x27;s Fork &amp; Pin/);
  assert.match(html, /quest\/42/);
  assert.match(html, /Ada &amp; Lin/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2Fsupport%3Freport%3Dcommunity-solo%26questId%3Dquest%252F42%26title%3DAda%2527s%2BFork%2B%2526%2BPin%26creator%3DAda%2B%2526%2BLin"/);
});

test("signed-out support renders Android's Community Multiplayer report handoff before sign-in", () => {
  const html = renderToStaticMarkup(React.createElement(MobileSupportScreen, {
    signedIn: false,
    reportContext: buildSupportReportContext({
      report: "community-multiplayer",
      questId: "community/table-42",
      title: "Ada's Fork Table",
      host: "Ada & Lin",
      status: "Open",
    }),
  }));

  assert.match(html, /Report Community Multiplayer Side Quest/);
  assert.match(html, /Ada&#x27;s Fork Table/);
  assert.match(html, /Side Quest ID: community\/table-42/);
  assert.match(html, /Host: Ada &amp; Lin/);
  assert.match(html, /Status: Open/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2Fsupport%3Freport%3Dcommunity-multiplayer/);
});

test("signed-out support keeps Android v338 copy diagnostics action reachable", () => {
  const html = renderToStaticMarkup(React.createElement(MobileSupportScreen, { signedIn: false }));

  assert.match(html, /App diagnostics/);
  assert.match(html, /Copy support details/);
  assert.match(html, /Sign in to message support/);
});

test("web support diagnostics include the same account and quest context as Android", () => {
  const diagnostics = buildWebSupportDiagnostics({
    url: "https://sidequestchess.com/support",
    userAgent: "Example Browser 1.0",
    platform: "macOS",
    recordedAt: "2026-07-17T22:00:00.000Z",
    account: {
      displayName: "Knight Rider",
      lichessUsername: "knight-rider",
      chessComUsername: null,
      activeSoloQuestTitle: "Knightmare Mode",
      activeMultiplayerQuestCount: 2,
      publicHostedMultiplayerQuestCount: 1,
    },
  });

  assert.equal(diagnostics, [
    "Side Quest Chess web diagnostics",
    "URL: https://sidequestchess.com/support",
    "Browser: Example Browser 1.0",
    "Platform: macOS",
    "Account: signed in as Knight Rider",
    "Lichess: knight-rider",
    "Chess.com: not connected",
    "Active solo quest: Knightmare Mode",
    "Active multiplayer quests: 2",
    "Public hosted multiplayer quests: 1",
    "Recorded at: 2026-07-17T22:00:00.000Z",
  ].join("\n"));
});

test("support account context counts only active related quests and public hosted quests", () => {
  const now = new Date("2026-07-17T22:00:00.000Z");
  const activeHosted = buildGroupQuest({
    hostUserId: "viewer",
    hostName: "Knight Rider",
    name: "Open hosted table",
    inviteMode: "public",
    startAt: "2026-07-17T20:00:00.000Z",
    endAt: "2026-07-18T20:00:00.000Z",
  });
  const activeJoined = buildGroupQuest({
    hostUserId: "other-host",
    hostName: "Other Host",
    name: "Joined table",
    startAt: "2026-07-17T20:00:00.000Z",
    endAt: "2026-07-18T20:00:00.000Z",
  });
  activeJoined.participants.push({
    userId: "viewer",
    provider: "lichess",
    username: "knight-rider",
    leaderboardName: "Knight Rider",
    joinedAt: "2026-07-17T20:30:00.000Z",
    score: 0,
    completedQuestIds: [],
  });
  const finishedHosted = buildGroupQuest({
    hostUserId: "viewer",
    hostName: "Knight Rider",
    name: "Finished table",
    inviteMode: "public",
    startAt: "2026-07-15T20:00:00.000Z",
    endAt: "2026-07-16T20:00:00.000Z",
  });
  const privateHosted = buildGroupQuest({
    hostUserId: "viewer",
    hostName: "Knight Rider",
    name: "Private hosted table",
    inviteMode: "private-key",
    startAt: "2026-07-17T20:00:00.000Z",
    endAt: "2026-07-18T20:00:00.000Z",
  });
  const unrelatedPublic = buildGroupQuest({
    hostUserId: "another-host",
    hostName: "Another Host",
    name: "Another public table",
    inviteMode: "public",
    startAt: "2026-07-17T20:00:00.000Z",
    endAt: "2026-07-18T20:00:00.000Z",
  });

  assert.deepEqual(buildWebSupportAccountContext({
    displayName: "Knight Rider",
    lichessUsername: "knight-rider",
    chessComUsername: "",
    activeSoloQuestTitle: "Knightmare Mode",
    relatedGroupQuests: [activeHosted, activeJoined, finishedHosted, privateHosted],
    publicGroupQuests: [activeHosted, finishedHosted, unrelatedPublic],
    userId: "viewer",
    now,
  }), {
    displayName: "Knight Rider",
    lichessUsername: "knight-rider",
    chessComUsername: null,
    activeSoloQuestTitle: "Knightmare Mode",
    activeMultiplayerQuestCount: 1,
    publicHostedMultiplayerQuestCount: 2,
  });
});

test("support group quest context degrades to empty counts when provider scans fail", async () => {
  const result = await loadWebSupportGroupQuestContext({
    loadRelatedGroupQuests: async () => { throw new Error("provider unavailable"); },
    loadPublicGroupQuests: async () => { throw new Error("provider unavailable"); },
  });

  assert.deepEqual(result, { relatedGroupQuests: [], publicGroupQuests: [] });
});

test("support group quest context preserves either successful provider scan", async () => {
  const related = buildGroupQuest({ hostUserId: "host", hostName: "Host", name: "Related" });
  const publicQuest = buildGroupQuest({ hostUserId: "host", hostName: "Host", name: "Public" });

  assert.deepEqual(await loadWebSupportGroupQuestContext({
    loadRelatedGroupQuests: async () => { throw new Error("related unavailable"); },
    loadPublicGroupQuests: async () => [publicQuest],
  }), { relatedGroupQuests: [], publicGroupQuests: [publicQuest] });

  assert.deepEqual(await loadWebSupportGroupQuestContext({
    loadRelatedGroupQuests: async () => [related],
    loadPublicGroupQuests: async () => { throw new Error("public unavailable"); },
  }), { relatedGroupQuests: [related], publicGroupQuests: [] });
});

test("support account context matches Android lifecycle boundaries and excludes official quests", () => {
  const now = new Date("2026-07-17T22:00:00.000Z");
  const makeParticipantQuest = (id: string, endAt: string, official = false) => {
    const quest = buildGroupQuest({
      hostUserId: "host",
      hostName: "Host",
      name: id,
      startAt: "2026-07-17T20:00:00.000Z",
      endAt,
    });
    quest.id = id;
    quest.official = official;
    quest.participants.push({
      userId: "viewer",
      provider: "lichess",
      username: "viewer",
      leaderboardName: "Viewer",
      joinedAt: "2026-07-17T20:30:00.000Z",
      score: 0,
      completedQuestIds: [],
    });
    return quest;
  };
  const equalBoundary = makeParticipantQuest("equal-boundary", now.toISOString());
  const malformedEnd = makeParticipantQuest("malformed-end", "not-a-date");
  const official = makeParticipantQuest("official-current", "2026-07-18T20:00:00.000Z", true);

  const context = buildWebSupportAccountContext({
    displayName: "Viewer",
    lichessUsername: null,
    chessComUsername: null,
    activeSoloQuestTitle: null,
    relatedGroupQuests: [equalBoundary, malformedEnd, official],
    publicGroupQuests: [equalBoundary, malformedEnd, official],
    userId: "viewer",
    now,
  });

  assert.equal(context.activeMultiplayerQuestCount, 2);
  assert.equal(context.publicHostedMultiplayerQuestCount, 2);
});

test("support route passes server-derived account context to the production support screen", () => {
  const routeSource = readFileSync(new URL("../src/app/support/page.tsx", import.meta.url), "utf8");
  const screenSource = readFileSync(new URL("../src/components/mobile-app-web-shell.tsx", import.meta.url), "utf8");
  const composerSource = readFileSync(new URL("../src/components/mobile-support-composer.tsx", import.meta.url), "utf8");

  assert.match(routeSource, /listUserRelatedGroupQuests/);
  assert.match(routeSource, /listPublicGroupQuests/);
  assert.match(routeSource, /loadWebSupportGroupQuestContext/);
  assert.match(routeSource, /buildWebSupportAccountContext/);
  assert.match(routeSource, /accountContext=\{accountContext\}/);
  assert.match(screenSource, /accountContext=\{accountContext\}/);
  assert.match(composerSource, /buildWebSupportDiagnostics/);
});
