import assert from "node:assert/strict";
import test from "node:test";

import { filterCommunitySoloCatalog, filterCustomCatalog, filterMultiplayerCatalog, filterSoloCatalog, paginateCatalog } from "../src/lib/catalog-models";
import { buildMobileWebMultiplayerLeaderboardRows, buildMobileWebMultiplayerPreview, buildUserMultiplayerRows, getMobileWebMultiplayerDetail, getMultiplayerHostFilter, mergeCommunityCatalogQuests } from "../src/lib/mobile-web-multiplayer";
import type { ServerGroupQuest } from "../src/lib/groupquests";

const likeSummary = { count: 0, likedByCurrentUser: false, likedByViewer: false };

function multiplayerRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "row-1", title: "Friday Forks", meta: "Community public · 2 players", href: "/groupquests/row-1",
    sourceBadge: "Community" as const, inviteCopy: "Fork practice", quests: ["Knight Fork"], rules: [],
    status: "Not joined" as const, playerCount: 2, playersLabel: "2 players", timeLeftLabel: "2d left", likeSummary,
    lifecycle: "open" as const, createdAt: "2026-07-10T00:00:00.000Z", startAt: "2026-07-11T00:00:00.000Z", endAt: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

function quest(overrides: Partial<ServerGroupQuest> = {}): ServerGroupQuest {
  return {
    id: "quest-1", hostUserId: "host", hostName: "Host", name: "Friday Forks", inviteCopy: "Forks",
    inviteMode: "public", questIds: ["knights-before-coffee"], providerMode: "both", providerLabel: "Both",
    startAt: "2026-07-10T00:00:00.000Z", endAt: "2026-07-20T00:00:00.000Z", rules: {},
    createdAt: "2026-07-09T00:00:00.000Z", participants: [], ...overrides,
  };
}

test("private invite codes use the canonical storage owner and never participant replicas", () => {
  const privateQuest = quest({ inviteMode: "private-key", inviteKey: "ROOK-742", participants: [{ userId: "participant", provider: "lichess", username: "rook-player", leaderboardName: "Rook Player", joinedAt: "2026-07-11T00:00:00.000Z" }] });
  const spoofedReplica = { ...privateQuest, hostUserId: "attacker" };

  const host = buildMobileWebMultiplayerPreview(privateQuest, "host", "Community", likeSummary, true, "host");
  const participant = buildMobileWebMultiplayerPreview(privateQuest, "participant", "Community", likeSummary, true, "host");
  const anonymous = buildMobileWebMultiplayerPreview(privateQuest, null, "Community", likeSummary, true, "host");
  const attacker = buildMobileWebMultiplayerPreview(spoofedReplica, "attacker", "Community", likeSummary, true, "canonical-owner");
  const canonicalOwner = buildMobileWebMultiplayerPreview(spoofedReplica, "canonical-owner", "Community", likeSummary, true, "canonical-owner");

  assert.equal(host.inviteKey, "ROOK-742");
  assert.equal(participant.inviteKey, undefined);
  assert.equal(anonymous.inviteKey, undefined);
  assert.equal(attacker.inviteKey, undefined);
  assert.equal(canonicalOwner.inviteKey, "ROOK-742");
});

test("custom Multiplayer snapshots keep rule provenance when their ID collides with an official quest", () => {
  const custom = quest({
    questIds: ["knights-before-coffee"],
    customQuestSnapshots: [{
      id: "knights-before-coffee",
      title: "Owner's Knight Variant",
      summary: "Win this exact owner-authored knight version.",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }),
    }],
  });

  const preview = buildMobileWebMultiplayerPreview(custom, "host", "Community", likeSummary);
  assert.deepEqual(preview.quests, ["Owner's Knight Variant"]);
  assert.deepEqual(preview.questRuleDetails, [{
    id: "knights-before-coffee",
    title: "Owner's Knight Variant",
    summary: "Win this exact owner-authored knight version.",
    status: "Included",
    imageUrl: null,
    glowColor: "rgba(245, 200, 106, .38)",
    ruleLines: ["Win the game."],
  }]);
});

test("malformed custom Multiplayer rule snapshots degrade to a safe rule label", () => {
  const malformed = quest({
    questIds: ["custom-malformed"],
    customQuestSnapshots: [{
      id: "custom-malformed",
      title: "Malformed Legacy Rule",
      summary: "A legacy snapshot with an invalid nested condition.",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [null] }),
    }],
  });

  const preview = buildMobileWebMultiplayerPreview(malformed, null, "Community", likeSummary);
  assert.deepEqual(preview.questRuleDetails?.[0]?.ruleLines, ["Custom rule"]);
});

test("private detail loader authorizes and discloses only from a canonical host record", async () => {
  const replica = quest({ hostUserId: "canonical-owner", inviteMode: "private-key", inviteKey: "ROOK-742" });
  const dependencies = {
    findQuestById: async () => ({ userId: "canonical-owner", groupQuest: replica }),
    getLikeSummaries: async () => new Map(),
  };

  const attacker = await getMobileWebMultiplayerDetail({} as never, replica.id, "attacker", dependencies);
  const canonicalOwner = await getMobileWebMultiplayerDetail({} as never, replica.id, "canonical-owner", dependencies);

  assert.equal(attacker, null);
  assert.equal(canonicalOwner?.status, "Hosted");
  assert.equal(canonicalOwner?.inviteKey, "ROOK-742");

  const participantReplica = quest({
    hostUserId: "missing-owner",
    inviteMode: "private-key",
    inviteKey: "ROOK-742",
    participants: [{ userId: "replica-user", provider: "lichess", username: "replica", leaderboardName: "Replica", joinedAt: "2026-07-11T00:00:00.000Z" }],
  });
  const participantOnly = await getMobileWebMultiplayerDetail({} as never, participantReplica.id, "replica-user", {
    findQuestById: async () => ({ userId: "replica-user", groupQuest: participantReplica }),
    getLikeSummaries: async () => new Map(),
  });

  assert.equal(participantOnly?.status, "Joined");
  assert.equal(participantOnly?.inviteKey, undefined);
});

test("solo catalog matches title and rule text, filters status, and sorts by name", () => {
  const rows = [
    { id: "b", title: "Quiet Bishop", meta: "Creator · Completed", href: "/b", status: "Completed" },
    { id: "a", title: "Knight Fork", meta: "Win material with a fork", href: "/a", status: "Ready" },
  ];
  assert.deepEqual(filterSoloCatalog(rows, { query: "fork", status: "all", sort: "name" }).map(row => row.id), ["a"]);
  assert.deepEqual(filterSoloCatalog(rows, { query: "", status: "completed", sort: "name" }).map(row => row.id), ["b"]);
  assert.deepEqual(filterSoloCatalog(rows, { query: "", status: "all", sort: "name" }).map(row => row.id), ["a", "b"]);
});

test("Community Solo catalog matches Android filters and deterministic sort choices", () => {
  const rows = [
    { id: "old", title: "Ancient Rook", meta: "quiet rule", href: "/old", updatedAtMs: 100, popularityScore: 2, likeCount: 8, completedByViewer: false, isNew: false },
    { id: "new", title: "Bold Bishop", meta: "fast rule", href: "/new", updatedAtMs: 300, popularityScore: 50, likeCount: 1, completedByViewer: false, isNew: true },
    { id: "done", title: "Calm Castle", meta: "finish rule", href: "/done", updatedAtMs: 200, popularityScore: 4, likeCount: 3, completedByViewer: true, isNew: false },
  ];

  assert.deepEqual(filterCommunitySoloCatalog(rows, { query: "", filter: "popular", sort: "popular" }).map(row => row.id), ["new", "old", "done"]);
  assert.deepEqual(filterCommunitySoloCatalog(rows, { query: "", filter: "new", sort: "newest" }).map(row => row.id), ["new"]);
  assert.deepEqual(filterCommunitySoloCatalog(rows, { query: "", filter: "completed", sort: "newest" }).map(row => row.id), ["done"]);
  assert.deepEqual(filterCommunitySoloCatalog(rows, { query: "rook", filter: "all", sort: "liked" }).map(row => row.id), ["old"]);
  assert.deepEqual(filterCommunitySoloCatalog(rows, { query: "", filter: "all", sort: "name" }).map(row => row.id), ["old", "new", "done"]);
});

test("catalog pagination exposes every row at the load-more boundary", () => {
  const rows = Array.from({ length: 13 }, (_, id) => ({ id }));
  assert.deepEqual(paginateCatalog(rows, 12), { rows: rows.slice(0, 12), hasMore: true, total: 13 });
  assert.deepEqual(paginateCatalog(rows, 24), { rows, hasMore: false, total: 13 });
});

test("custom catalog searches, filters lifecycle and visibility, and sorts deterministically", () => {
  const rows = [
    { id: "draft", title: "Quiet Bishop", meta: "private positional rule", href: "/edit/draft", lifecycle: "draft" as const, visibility: "private" as const, updatedAt: "2026-07-10T00:00:00.000Z" },
    { id: "public", title: "Knight Fork", meta: "public fork rule", href: "/detail/public", lifecycle: "published" as const, visibility: "public" as const, updatedAt: "2026-07-12T00:00:00.000Z" },
    { id: "archived", title: "Old Rook", meta: "private archive", href: "/edit/archived", lifecycle: "archived" as const, visibility: "private" as const, updatedAt: "2026-07-11T00:00:00.000Z" },
  ];
  assert.deepEqual(filterCustomCatalog(rows, { query: "fork", filter: "all", sort: "newest" }).map(row => row.id), ["public"]);
  assert.deepEqual(filterCustomCatalog(rows, { query: "", filter: "draft", sort: "name" }).map(row => row.id), ["draft"]);
  assert.deepEqual(filterCustomCatalog(rows, { query: "", filter: "public", sort: "newest" }).map(row => row.id), ["public"]);
  assert.deepEqual(filterCustomCatalog(rows, { query: "", filter: "archived", sort: "newest" }).map(row => row.id), ["archived"]);
  assert.deepEqual(filterCustomCatalog(rows, { query: "", filter: "all", sort: "newest" }).map(row => row.id), ["public", "archived", "draft"]);
});

test("multiplayer catalog searches quests and filters joined, hosted, finished, and open rows", () => {
  const rows = [
    multiplayerRow({ id: "open", quests: ["Castle escape"] }),
    multiplayerRow({ id: "joined", status: "Joined", title: "Joined Knights" }),
    multiplayerRow({ id: "hosted", status: "Hosted", title: "Hosted Bishops" }),
    multiplayerRow({ id: "finished", lifecycle: "finished", title: "Finished Rooks" }),
  ];
  assert.deepEqual(filterMultiplayerCatalog(rows, { query: "castle", filter: "all", sort: "closing" }).map(row => row.id), ["open"]);
  for (const filter of ["joined", "hosted", "finished"] as const) {
    assert.deepEqual(filterMultiplayerCatalog(rows, { query: "", filter, sort: "closing" }).map(row => row.id), [filter]);
  }
  assert.deepEqual(filterMultiplayerCatalog(rows, { query: "", filter: "open", sort: "closing" }).map(row => row.id), ["open", "joined", "hosted"]);
});

test("multiplayer community catalog matches Android liked sorting", () => {
  const rows = [
    multiplayerRow({ id: "older-liked", likeSummary: { count: 7, likedByViewer: false }, createdAt: "2026-07-10T00:00:00.000Z", startAt: "2026-07-08T00:00:00.000Z" }),
    multiplayerRow({ id: "newer-liked", likeSummary: { count: 7, likedByViewer: true }, createdAt: "2026-07-08T00:00:00.000Z", startAt: "2026-07-09T00:00:00.000Z" }),
    multiplayerRow({ id: "less-liked", likeSummary: { count: 2, likedByViewer: false }, createdAt: "2026-07-11T00:00:00.000Z", startAt: "2026-07-10T00:00:00.000Z" }),
  ];

  assert.deepEqual(
    filterMultiplayerCatalog(rows, { query: "", filter: "all", sort: "liked" }).map(row => row.id),
    ["newer-liked", "older-liked", "less-liked"],
  );
});

test("multiplayer community catalog matches Android player-count sorting", () => {
  const rows = [
    multiplayerRow({ id: "two-players", playerCount: 2 }),
    multiplayerRow({ id: "twelve-players", playerCount: 12 }),
    multiplayerRow({ id: "seven-players", playerCount: 7 }),
  ];

  assert.deepEqual(
    filterMultiplayerCatalog(rows, { query: "", filter: "all", sort: "players" }).map(row => row.id),
    ["twelve-players", "seven-players", "two-players"],
  );
});

test("multiplayer community catalog matches Android new sorting by start time", () => {
  const rows = [
    multiplayerRow({ id: "created-later", createdAt: "2026-07-12T00:00:00.000Z", startAt: "2026-07-13T00:00:00.000Z" }),
    multiplayerRow({ id: "starts-later", createdAt: "2026-07-10T00:00:00.000Z", startAt: "2026-07-15T00:00:00.000Z" }),
  ];

  assert.deepEqual(
    filterMultiplayerCatalog(rows, { query: "", filter: "all", sort: "newest" }).map(row => row.id),
    ["starts-later", "created-later"],
  );
});

test("signed-in related quests are classified as hosted, joined, or finished while signed-out gets no private rows", () => {
  const related = [
    quest({ id: "hosted", hostUserId: "me" }),
    quest({ id: "joined", participants: [{ userId: "me", provider: "lichess", username: "me", leaderboardName: "Me", joinedAt: "2026-07-10T00:00:00.000Z" }] }),
    quest({ id: "finished", hostUserId: "me", endAt: "2026-07-11T00:00:00.000Z" }),
  ];
  const rows = buildUserMultiplayerRows(related, "me", new Map(), Date.parse("2026-07-12T00:00:00.000Z"));
  assert.deepEqual(rows.map(row => [row.id, row.status, row.lifecycle]), [
    ["hosted", "Hosted", "open"], ["joined", "Joined", "open"], ["finished", "Hosted", "finished"],
  ]);
  assert.deepEqual(buildUserMultiplayerRows(related, null, new Map(), Date.now()), []);
});

test("Multiplayer rows expose Android-ranked final standings without leaking user ids", () => {
  const finished = quest({
    id: "finished",
    endAt: "2026-07-11T00:00:00.000Z",
    questIds: ["finish-any-game", "knights-before-coffee", "bishop-field-trip"],
    participants: [
      { userId: "other", provider: "lichess", username: "ada", leaderboardName: "Ada", joinedAt: "2026-07-10T00:00:00.000Z", completedQuestIds: ["finish-any-game", "knights-before-coffee", "bishop-field-trip"] },
      { userId: "me", provider: "chesscom", username: "current", leaderboardName: "Current player", joinedAt: "2026-07-10T00:00:00.000Z", completedQuestIds: ["finish-any-game", "knights-before-coffee"] },
    ],
  });

  const leaderboardRows = buildMobileWebMultiplayerLeaderboardRows(finished, "me");
  assert.deepEqual(leaderboardRows, [
    { rank: 1, name: "Ada", provider: "lichess · ada", progress: "3/3", placement: "Gold", viewer: false },
    { rank: 2, name: "Current player", provider: "chess.com · current", progress: "2/3", placement: "Silver", viewer: true },
  ]);
  assert.doesNotMatch(JSON.stringify(leaderboardRows), /\"userId\"/);
});

test("filters return an empty list only when no row matches", () => {
  assert.deepEqual(filterSoloCatalog([], { query: "none", status: "all", sort: "name" }), []);
  assert.deepEqual(filterMultiplayerCatalog([multiplayerRow()], { query: "missing", filter: "all", sort: "closing" }), []);
});

test("Multiplayer host query accepts one exact canonical name and rejects ambiguous or oversized input", () => {
  assert.equal(getMultiplayerHostFilter(" Ada "), " Ada ");
  assert.equal(getMultiplayerHostFilter(["Ada", "Bob"]), null);
  assert.equal(getMultiplayerHostFilter(""), null);
  assert.equal(getMultiplayerHostFilter("A".repeat(81)), null);
});

test("Community catalog data keeps finished public quests available for host shelves", () => {
  const openPublic = quest({ id: "open-public" });
  const finishedPublic = quest({ id: "finished-public", endAt: "2026-07-01T00:00:00.000Z" });
  const relatedPrivate = quest({ id: "related-private", inviteMode: "private-key" });
  assert.deepEqual(
    mergeCommunityCatalogQuests([openPublic, finishedPublic], [relatedPrivate]).map(item => item.id),
    ["open-public", "finished-public", "related-private"],
  );
});
