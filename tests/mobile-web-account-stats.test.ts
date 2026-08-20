import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildGroupQuest } from "../src/lib/groupquests";
import { buildSoloTrophyRows, combineTrophyRows, getActiveMultiplayerAccountRow, getMobileWebAccountOverview, loadOptionalCommunityTrophyQuests, summarizeActiveMultiplayerAccount, summarizeMobileWebAccountStats } from "../src/lib/mobile-web-trophies";

test("optional Community reward loading preserves Official and owned trophies on provider failure", async () => {
  assert.deepEqual(await loadOptionalCommunityTrophyQuests(async () => {
    throw new Error("Clerk unavailable");
  }), []);
});

test("Trophy Cabinet keeps every Solo reward after the bounded Multiplayer podium shelf", () => {
  const multiplayerRows = Array.from({ length: 12 }, (_, index) => ({
    id: `multiplayer-${index}`,
    title: `Podium ${index}`,
    meta: "Official Multiplayer placement",
    href: `/groupquests/${index}`,
    source: "officialMultiplayer" as const,
  }));
  const soloRows = [
    { id: "solo-official", title: "Official", meta: "Official Solo", href: "/challenges/official", source: "officialSolo" as const },
    { id: "solo-custom", title: "Custom", meta: "Custom Solo", href: "/custom-side-quests/custom", source: "customSolo" as const },
    { id: "solo-community", title: "Community", meta: "Community Solo", href: "/challenges/community/community", source: "communitySolo" as const },
  ];

  assert.equal(combineTrophyRows(multiplayerRows, soloRows).length, 15);
  assert.deepEqual(combineTrophyRows(multiplayerRows, soloRows, { multiplayerLimit: 4, soloLimit: 5 }).map((row) => row.id), [
    "multiplayer-0", "multiplayer-1", "multiplayer-2", "multiplayer-3", "solo-official", "solo-custom", "solo-community",
  ]);
});

test("Trophy Cabinet includes completed owned Custom and Community Solo rewards with canonical provenance", () => {
  const customQuest = {
    id: "custom-alpha",
    title: "Knight Errand",
    summary: "Move the original knight before move ten.",
    config: "{}",
    badgeImageUrl: "/badges/custom/community/community-coat-07.png",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
  const communityQuest = {
    ...customQuest,
    id: "community-beta",
    title: "Pawn Parade",
    badgeImageUrl: "/badges/custom/community/community-coat-08.png",
  };

  const rows = buildSoloTrophyRows(
    ["finish-any-game", customQuest.id, communityQuest.id],
    [customQuest],
    [communityQuest],
  );

  assert.deepEqual(rows.map(({ id, title, meta, href, image, source }) => ({ id, title, meta, href, image, source })), [
    {
      id: "solo-finish-any-game",
      title: "Any Game Counts",
      meta: "Official Solo Side Quest · The First Game Shield",
      href: "/challenges/finish-any-game",
      image: "/mobile-source/badges/v6/proof-loop-test-badge.png",
      source: "officialSolo",
    },
    {
      id: "solo-custom-alpha",
      title: "Knight Errand",
      meta: "Custom Solo Side Quest · Custom Side Quest",
      href: "/custom-side-quests/custom-alpha",
      image: "/badges/custom/community/community-coat-07.png",
      source: "customSolo",
    },
    {
      id: "solo-community-beta",
      title: "Pawn Parade",
      meta: "Community Solo Side Quest · Community Side Quest",
      href: "/challenges/community/community-beta",
      image: "/badges/custom/community/community-coat-08.png",
      source: "communitySolo",
    },
  ]);
});

test("authenticated trophy overview carries completed Custom and Community records into its rendered rows", async () => {
  const client = {
    users: {
      getUserList: async () => ({ data: [], totalCount: 0 }),
    },
  };
  const makeQuest = (id: string, title: string) => ({ id, title, badgeImageUrl: null });

  const overview = await getMobileWebAccountOverview(client, "viewer-1", {
    completedChallengeIds: ["custom-alpha", "community-beta"],
    attempts: [],
    customSideQuestIds: ["custom-alpha"],
    ownedCustomQuests: [makeQuest("custom-alpha", "Knight Errand")],
    communityQuests: [makeQuest("community-beta", "Pawn Parade")],
    limit: 12,
  });

  assert.deepEqual(overview.trophyRows.map((row) => [row.title, row.source]), [
    ["Knight Errand", "customSolo"],
    ["Pawn Parade", "communitySolo"],
  ]);
});

test("Account trophy aggregation keeps the related host record over a public participant replica", async () => {
  const canonical = buildGroupQuest({
    hostUserId: "host-user",
    hostName: "Host",
    name: "Canonical final table",
    inviteMode: "public",
    startAt: "2026-06-01T00:00:00.000Z",
    endAt: "2026-06-02T00:00:00.000Z",
  });
  canonical.id = "replicated-final-table";
  canonical.participants = [{
    userId: "viewer-1", provider: "lichess", username: "viewer", leaderboardName: "Viewer",
    joinedAt: "2026-06-01T00:00:00.000Z", score: 300, completedQuestIds: canonical.questIds,
    questFinishedAt: {},
  }];
  const replica = { ...structuredClone(canonical), name: "Stale public replica", participants: [{ ...canonical.participants[0], score: 10 }] };
  const client = { users: { getUserList: async () => ({
    data: [
      { id: "viewer-1", privateMetadata: { sqcGroupQuests: [replica] } },
      { id: "host-user", privateMetadata: { sqcGroupQuests: [canonical] } },
    ],
    totalCount: 2,
  }) } };

  const overview = await getMobileWebAccountOverview(client, "viewer-1", {
    completedChallengeIds: [], attempts: [], customSideQuestIds: [], limit: null,
  });

  assert.equal(overview.trophyRows[0]?.title, "Canonical final table");
});

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

test("authenticated Account section navigator targets every desktop command-center region", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.AccountSectionNavigator, "function");
  const html = renderToStaticMarkup(createElement(accountPage.AccountSectionNavigator));

  assert.match(html, /<nav[^>]*aria-label="Account sections"/);
  for (const [label, target] of [
    ["Side Quests", "account-side-quests"],
    ["Progress", "account-progress"],
    ["Chess strength", "account-strength"],
    ["Trophies", "account-trophies"],
    ["Support", "account-support"],
    ["Security", "account-security"],
  ]) {
    assert.match(html, new RegExp(`href="#${target}"[^>]*>${label}<`));
  }
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

test("authenticated Account summarizes playable and draft Custom Side Quests like Android v338", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.getAccountCustomQuestSummary, "function");

  assert.deepEqual(accountPage.getAccountCustomQuestSummary([
    { id: "published", title: "Knight Errand", summary: "Playable", config: "{}", lifecycle: "published" as const, visibility: "private" as const, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z" },
    { id: "draft", title: "Pawn Room", summary: "Draft", config: "{}", lifecycle: "draft" as const, visibility: "private" as const, createdAt: "2026-07-02T00:00:00.000Z", updatedAt: "2026-07-02T00:00:00.000Z" },
    { id: "archived", title: "Old experiment", summary: "Archived", config: "{}", lifecycle: "archived" as const, visibility: "private" as const, createdAt: "2026-07-03T00:00:00.000Z", updatedAt: "2026-07-03T00:00:00.000Z" },
  ]), {
    meta: "1 playable · 1 draft · private by default",
    status: "3 made",
  });

  assert.deepEqual(accountPage.getAccountCustomQuestSummary([]), {
    meta: "Build a private custom Side Quest for solo or multiplayer use.",
    status: "Create",
  });
});

test("authenticated Account renders the Android Custom Side Quest summary from canonical lifecycle data", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.AccountCustomQuestSummaryRow, "function");
  const html = renderToStaticMarkup(createElement(accountPage.AccountCustomQuestSummaryRow, {
    customSideQuests: [
      { id: "published", title: "Knight Errand", summary: "Playable", config: "{}", lifecycle: "published" as const, visibility: "private" as const, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z" },
      { id: "draft", title: "Pawn Room", summary: "Draft", config: "{}", lifecycle: "draft" as const, visibility: "private" as const, createdAt: "2026-07-02T00:00:00.000Z", updatedAt: "2026-07-02T00:00:00.000Z" },
      { id: "archived", title: "Old experiment", summary: "Archived", config: "{}", lifecycle: "archived" as const, visibility: "private" as const, createdAt: "2026-07-03T00:00:00.000Z", updatedAt: "2026-07-03T00:00:00.000Z" },
    ],
  }));

  assert.match(html, /1 playable · 1 draft · private by default/);
  assert.match(html, />3 made</);
  assert.match(html, /href="\/custom-side-quests"/);
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

test("authenticated Account preserves an active owned Custom Solo identity and exact destination", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.resolveAccountActiveSoloRow, "function");

  assert.deepEqual(accountPage.resolveAccountActiveSoloRow(
    { id: "custom/knight", status: "active" },
    [{
      id: "custom/knight",
      title: "Knight Errand",
      summary: "Move the original knight before move ten.",
      badgeImageUrl: "/badges/custom/community/community-coat-07.png",
    }],
    [],
  ), {
    title: "Knight Errand",
    objective: "Move the original knight before move ten.",
    href: "/custom-side-quests/custom%2Fknight",
    image: "/badges/custom/community/community-coat-07.png",
  });
});

test("authenticated Account preserves an active Community Solo identity and exact destination", async () => {
  const accountPage = await import("../src/app/account/page");
  const communityQuest = {
    id: "community/pawns",
    title: "Pawn Parade",
    summary: "Advance three pawns before move twelve.",
    config: "{}",
    lifecycle: "published" as const,
    visibility: "public" as const,
    badgeImageUrl: "/badges/custom/community/community-coat-08.png",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    creatorName: "Quest runner",
    creatorKey: "sqc-player-viewer",
    creatorUserId: "viewer",
    creatorBrowsePath: "/community-side-quests?creator=sqc-player-viewer",
    detailPath: "/challenges/community/community%2Fpawns",
    ruleLabel: "Custom rule",
    ruleDetails: ["Custom rule"],
    updatedAtMs: 1,
    stats: { soloAttempts: 0, soloSelections: 1, soloCompletions: 0, multiplayerLineups: 0, multiplayerAttempts: 0, multiplayerFulfillments: 0 },
    popularityScore: 1,
    likeSummary: { count: 0, likedByViewer: false },
  };

  assert.deepEqual(accountPage.resolveAccountActiveSoloRow(
    { id: communityQuest.id, status: "active" },
    [],
    [communityQuest],
  ), {
    title: "Pawn Parade",
    objective: "Advance three pawns before move twelve.",
    href: "/challenges/community/community%2Fpawns",
    image: "/badges/custom/community/community-coat-08.png",
  });
});

test("authenticated Account keeps Official and empty Solo row behavior", async () => {
  const accountPage = await import("../src/app/account/page");

  assert.deepEqual(accountPage.resolveAccountActiveSoloRow(
    { id: "finish-any-game", status: "active" },
    [],
    [],
  ), {
    title: "Any Game Counts",
    objective: "Play any finished game — win, lose, or draw — and complete the quest.",
    href: "/challenges/finish-any-game",
    image: "/mobile-source/badges/v6/proof-loop-test-badge.png",
  });
  assert.equal(accountPage.resolveAccountActiveSoloRow(null, [], []), null);
});

test("authenticated Account renders the resolved active Community Solo row", async () => {
  const accountPage = await import("../src/app/account/page");
  assert.equal(typeof accountPage.AccountSoloRow, "function");
  const communityQuest = {
    id: "community/pawns",
    title: "Pawn Parade",
    summary: "Advance three pawns before move twelve.",
    badgeImageUrl: "/badges/custom/community/community-coat-08.png",
    detailPath: "/challenges/community/community%2Fpawns",
  };

  const html = renderToStaticMarkup(createElement(accountPage.AccountSoloRow, {
    activeChallenge: { id: communityQuest.id, status: "active" },
    checkedAt: "2026-07-29T00:00:00.000Z",
    customSideQuests: [],
    communityQuests: [communityQuest],
  }));

  assert.match(html, /Solo Side Quest: Pawn Parade/);
  assert.match(html, /Advance three pawns before move twelve\./);
  assert.match(html, /href="\/challenges\/community\/community%2Fpawns"/);
  assert.match(html, /%2Fbadges%2Fcustom%2Fcommunity%2Fcommunity-coat-08\.png/);
  assert.match(html, />Active</);
});
