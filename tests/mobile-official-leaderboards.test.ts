import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

import { MobileOfficialLeaderboardsScreen } from "../src/components/mobile-app-web-shell";
import type { MobileWebMultiplayerPreview, MobileWebMultiplayerResult, MobileWebOfficialWeek } from "../src/lib/mobile-web-multiplayer";

const current: MobileWebMultiplayerPreview = {
  id: "official-current",
  title: "Official Easy Week",
  meta: "3 players · 2 days left",
  href: "/groupquests/official-current",
  sourceBadge: "SQC Official",
  publiclyListed: true,
  inviteCopy: "Official weekly challenge",
  quests: ["Finish a game"],
  rules: [],
  status: "Joined",
  viewerJoined: true,
  playersLabel: "3 players",
  timeLeftLabel: "2 days left",
  leaderboardRows: [{ rank: 1, name: "Current player", provider: "lichess · player", progress: "1/1", placement: "Gold", viewer: true }],
  likeSummary: { count: 2, likedByViewer: true },
  lifecycle: "open",
  createdAt: "2026-07-20T00:00:00.000Z",
  endAt: "2026-07-22T00:00:00.000Z",
};

const previous: MobileWebMultiplayerResult = {
  id: "official-previous",
  title: "Official Hard Week",
  href: "/groupquests/official-previous",
  summary: "Final · 8 players",
  podiumRows: [{ placement: "Gold", name: "Winner", meta: "3/3", pending: false }],
};

const week: MobileWebOfficialWeek = {
  id: "week-28",
  title: "Week 28",
  meta: "July 6–12 · 3 official results",
  href: "/multiplayer?week=week-28",
  questCount: 3,
};

test("official leaderboard route matches Android signed-out and signed-in screen states", () => {
  const signedOut = renderToStaticMarkup(React.createElement(MobileOfficialLeaderboardsScreen, { signedIn: false, currentRows: [], previousRows: [], earlierWeeks: [] }));
  assert.match(signedOut, /Official Leaderboards\./);
  assert.match(signedOut, /Sign in to see active official weekly leaderboards, final results, and the official archive\./);
  assert.doesNotMatch(signedOut, /Current week|Previous week|Archive/);

  const signedIn = renderToStaticMarkup(React.createElement(MobileOfficialLeaderboardsScreen, { signedIn: true, currentRows: [current], previousRows: [previous], earlierWeeks: [week] }));
  assert.match(signedIn, /Three official Multiplayer Side Quests run every week/);
  assert.match(signedIn, /Current week/);
  assert.match(signedIn, /Previous week/);
  assert.match(signedIn, /Archive/);
  assert.match(signedIn, /href="\/groupquests\/official-current"/);
  assert.match(signedIn, /href="\/groupquests\/official-previous"/);
  assert.match(signedIn, /href="\/multiplayer\?week=week-28"/);
  assert.doesNotMatch(signedIn, /Create Multiplayer Side Quest|Join private Multiplayer Side Quest/);
});

test("official leaderboard seal stays in viewport flow without changing shared Multiplayer heroes", async () => {
  const html = renderToStaticMarkup(React.createElement(MobileOfficialLeaderboardsScreen, { signedIn: false, currentRows: [], previousRows: [], earlierWeeks: [] }));
  const css = await readFile(new URL("../src/app/mobile-web.css", import.meta.url), "utf8");

  assert.match(html, /class="sqc-stack sqc-official-leaderboards-screen"/);
  assert.match(css, /\.sqc-official-leaderboards-screen \.sqc-multiplayer-detail-hero > \.sqc-section-mark\.group\s*\{[\s\S]*position:\s*relative[\s\S]*top:\s*auto[\s\S]*left:\s*auto[\s\S]*transform:\s*none[\s\S]*display:\s*grid/);
  assert.doesNotMatch(css, /(^|\n)\.sqc-multiplayer-detail-hero > \.sqc-section-mark\.group\s*\{/);
});
