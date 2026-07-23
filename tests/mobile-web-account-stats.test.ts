import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getActiveMultiplayerAccountRow, summarizeActiveMultiplayerAccount, summarizeMobileWebAccountStats } from "../src/lib/mobile-web-trophies";

test("matches Android Account multiplayer summary from active joined and hosted quests", () => {
  const summary = summarizeActiveMultiplayerAccount("viewer-1", [
    {
      name: "Older joined table",
      hostUserId: "host-1",
      startAt: "2026-07-01T00:00:00.000Z",
      endAt: "2026-08-01T00:00:00.000Z",
      participants: [{ userId: "viewer-1" }],
    },
    {
      name: "Newest hosted table",
      hostUserId: "viewer-1",
      startAt: "2026-07-15T00:00:00.000Z",
      endAt: "2026-08-15T00:00:00.000Z",
      participants: [],
    },
    {
      name: "Finished table",
      hostUserId: "viewer-1",
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-30T00:00:00.000Z",
      participants: [],
    },
  ], new Date("2026-07-20T00:00:00.000Z"));

  assert.deepEqual(summary, {
    activeCount: 2,
    hostedCount: 1,
    joinedCount: 1,
    firstTitle: "Newest hosted table",
  });
});

test("does not count unrelated or finished Multiplayer quests on Account", () => {
  const summary = summarizeActiveMultiplayerAccount("viewer-1", [
    {
      name: "Unrelated table",
      hostUserId: "host-1",
      startAt: "2026-07-01T00:00:00.000Z",
      endAt: "2026-08-01T00:00:00.000Z",
      participants: [{ userId: "someone-else" }],
    },
    {
      name: "Finished joined table",
      hostUserId: "host-2",
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-30T00:00:00.000Z",
      participants: [{ userId: "viewer-1" }],
    },
  ], new Date("2026-07-20T00:00:00.000Z"));

  assert.deepEqual(summary, {
    activeCount: 0,
    hostedCount: 0,
    joinedCount: 0,
    firstTitle: null,
  });
});

test("renders the Android Account multiplayer row from authenticated account data", () => {
  assert.deepEqual(getActiveMultiplayerAccountRow({
    activeCount: 3,
    hostedCount: 1,
    joinedCount: 2,
    firstTitle: "Friday Knight Fight",
  }), {
    title: "Active Multiplayer Side Quests",
    meta: "1 hosted · 2 joined · Friday Knight Fight",
    status: "3 active",
  });

  assert.deepEqual(getActiveMultiplayerAccountRow({
    activeCount: 0,
    hostedCount: 0,
    joinedCount: 0,
    firstTitle: null,
  }), {
    title: "Multiplayer Side Quests",
    meta: "Join an official table, join a community table, or create one for friends.",
    status: "Open",
  });
});

test("authenticated Account row renders the server-derived Multiplayer summary", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.AccountMultiplayerRow, "function");
  const html = renderToStaticMarkup(createElement(accountPage.AccountMultiplayerRow, {
    summary: {
      activeCount: 3,
      hostedCount: 1,
      joinedCount: 2,
      firstTitle: "Friday Knight Fight",
    },
  }));

  assert.match(html, /Active Multiplayer Side Quests/);
  assert.match(html, /1 hosted · 2 joined · Friday Knight Fight/);
  assert.match(html, />3 active</);
});

test("authenticated Account previews the first two non-archived Custom Side Quests like Android v338", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.AccountCustomQuestRows, "function");
  const customSideQuests = [
    { id: "archived", title: "Old experiment", summary: "Hidden history", config: "{}", lifecycle: "archived" as const, visibility: "private" as const, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z" },
    { id: "published-private", title: "Knight Errand", summary: "Move the original knight.", config: "{}", lifecycle: "published" as const, visibility: "private" as const, badgeImageUrl: "/badges/custom/knight.png", createdAt: "2026-07-02T00:00:00.000Z", updatedAt: "2026-07-02T00:00:00.000Z" },
    { id: "draft-public", title: "Pawn Room", summary: 42 as unknown as string, config: "{}", lifecycle: "draft" as const, visibility: "public" as const, createdAt: "2026-07-03T00:00:00.000Z", updatedAt: "2026-07-03T00:00:00.000Z" },
    { id: "third", title: "Third visible quest", summary: "Must stay outside the compact preview.", config: "{}", lifecycle: "published" as const, visibility: "public" as const, createdAt: "2026-07-04T00:00:00.000Z", updatedAt: "2026-07-04T00:00:00.000Z" },
  ];

  const html = renderToStaticMarkup(createElement(accountPage.AccountCustomQuestRows, { customSideQuests }));

  assert.match(html, /Created: Knight Errand/);
  assert.match(html, /Move the original knight\./);
  assert.match(html, />Private</);
  assert.match(html, /href="\/custom-side-quests\/published-private"/);
  assert.match(html, /Created: Pawn Multiplayer Side Quest/);
  assert.match(html, /Player-made Side Quest rule\./);
  assert.match(html, />Draft</);
  assert.match(html, /href="\/custom-side-quests\/draft-public"/);
  assert.doesNotMatch(html, /Old experiment|Third visible quest/);
});

test("summarizes Android-matched Account progress from canonical quest data", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: ["official-win", "custom-alpha"],
    attempts: [
      { challengeId: "official-win" },
      { challengeId: "custom-alpha" },
      { id: "custom-alpha:second-check" },
      { challengeId: "custom-beta" },
    ],
    customSideQuestIds: ["custom-alpha", "custom-beta"],
    multiplayerTrophyCount: 2,
    groupQuests: [
      {
        questIds: ["custom-alpha"],
        participants: [
          { completedQuestIds: ["custom-alpha"] },
          { completedQuestIds: [] },
        ],
      },
      {
        questIds: ["custom-alpha", "custom-beta"],
        participants: [
          { completedQuestIds: ["custom-beta"] },
          { completedQuestIds: ["custom-alpha", "custom-beta"] },
          { completedQuestIds: [] },
        ],
      },
    ],
  });

  assert.deepEqual(stats, {
    completedCount: 2,
    proofCount: 4,
    coatCount: 4,
    podiumCount: 2,
    customQuestCount: 2,
    customTries: 11,
    customWins: 5,
  });
});

test("caps Multiplayer podium stats at the Android account payload limit", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: ["solo-win"],
    attempts: [],
    customSideQuestIds: [],
    multiplayerTrophyCount: 13,
    groupQuests: [],
  });

  assert.equal(stats.podiumCount, 12);
  assert.equal(stats.coatCount, 13);
});

test("counts a participant fulfillment once even if malformed progress repeats a quest id", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: [],
    attempts: [],
    customSideQuestIds: ["custom-alpha"],
    multiplayerTrophyCount: 0,
    groupQuests: [{
      questIds: ["custom-alpha"],
      participants: [{ completedQuestIds: ["custom-alpha", "custom-alpha"] }],
    }],
  });

  assert.equal(stats.customWins, 1);
});

test("does not count unrelated Solo attempts or Multiplayer lineups as custom progress", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: ["official-only"],
    attempts: [{ challengeId: "official-only" }, { id: "legacy-official:attempt" }],
    customSideQuestIds: [],
    multiplayerTrophyCount: 0,
    groupQuests: [{ questIds: ["official-only"], participants: [{ completedQuestIds: ["official-only"] }] }],
  });

  assert.deepEqual(stats, {
    completedCount: 1,
    proofCount: 2,
    coatCount: 1,
    podiumCount: 0,
    customQuestCount: 0,
    customTries: 0,
    customWins: 0,
  });
});
