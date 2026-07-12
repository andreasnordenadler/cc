import assert from "node:assert/strict";
import test from "node:test";

import { filterMultiplayerCatalog, filterSoloCatalog, paginateCatalog } from "../src/lib/catalog-models";
import { buildUserMultiplayerRows } from "../src/lib/mobile-web-multiplayer";
import type { ServerGroupQuest } from "../src/lib/groupquests";

const likeSummary = { count: 0, likedByCurrentUser: false };

function multiplayerRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "row-1", title: "Friday Forks", meta: "Community public · 2 players", href: "/groupquests/row-1",
    sourceBadge: "Community" as const, inviteCopy: "Fork practice", quests: ["Knight Fork"], rules: [],
    status: "Not joined" as const, playersLabel: "2 players", timeLeftLabel: "2d left", likeSummary,
    lifecycle: "open" as const, createdAt: "2026-07-10T00:00:00.000Z", endAt: "2026-07-20T00:00:00.000Z",
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

test("solo catalog matches title and rule text, filters status, and sorts by name", () => {
  const rows = [
    { id: "b", title: "Quiet Bishop", meta: "Creator · Completed", href: "/b", status: "Completed" },
    { id: "a", title: "Knight Fork", meta: "Win material with a fork", href: "/a", status: "Ready" },
  ];
  assert.deepEqual(filterSoloCatalog(rows, { query: "fork", status: "all", sort: "name" }).map(row => row.id), ["a"]);
  assert.deepEqual(filterSoloCatalog(rows, { query: "", status: "completed", sort: "name" }).map(row => row.id), ["b"]);
  assert.deepEqual(filterSoloCatalog(rows, { query: "", status: "all", sort: "name" }).map(row => row.id), ["a", "b"]);
});

test("catalog pagination exposes every row at the load-more boundary", () => {
  const rows = Array.from({ length: 13 }, (_, id) => ({ id }));
  assert.deepEqual(paginateCatalog(rows, 12), { rows: rows.slice(0, 12), hasMore: true, total: 13 });
  assert.deepEqual(paginateCatalog(rows, 24), { rows, hasMore: false, total: 13 });
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

test("filters return an empty list only when no row matches", () => {
  assert.deepEqual(filterSoloCatalog([], { query: "none", status: "all", sort: "name" }), []);
  assert.deepEqual(filterMultiplayerCatalog([multiplayerRow()], { query: "missing", filter: "all", sort: "closing" }), []);
});
