import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileCommunitySideQuestsScreen, MobileMultiplayerSideQuestsScreen } from "@/components/mobile-app-web-shell";
import type { MobileWebMultiplayerPreview } from "@/lib/mobile-web-multiplayer";

const row: MobileWebMultiplayerPreview = {
  id: "community-row",
  title: "A complete community Multiplayer title",
  meta: "Community public · 4 players · Final",
  href: "/multiplayer-side-quests/community-row",
  sourceBadge: "Community",
  inviteCopy: "Join the table.",
  quests: ["finish-any-game"],
  rules: [["Mode", "Any"]],
  status: "Joined",
  playersLabel: "4 players",
  timeLeftLabel: "Final",
  leaderboardRows: [],
  likeSummary: { count: 0, likedByViewer: false },
  lifecycle: "finished",
  createdAt: "2026-07-01T00:00:00.000Z",
  endAt: "2026-07-02T00:00:00.000Z",
};

test("Solo and Multiplayer swap controls are real links with the Android swap icon", () => {
  const solo = renderToStaticMarkup(createElement(MobileCommunitySideQuestsScreen, { rows: [], signedIn: true }));
  assert.match(solo, /class="sqc-brand-tabs sqc-solo-brand-tabs"/);
  assert.match(solo, /aria-label="Switch to Official Side Quests"/);
  assert.match(solo, /data-icon="swap-horizontal"/);
  assert.match(solo, /href="\/side-quests"/);
  assert.doesNotMatch(solo, /role="separator"/);

  const multiplayer = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, { selectedTab: "community", signedIn: true, officialRows: [], communityRows: [row] }));
  assert.match(multiplayer, /aria-label="Switch to Official Multiplayer Side Quests"/);
  assert.match(multiplayer, /href="\/multiplayer-side-quests"/);
  assert.doesNotMatch(multiplayer, /role="separator"/);
});

test("text-only community quest rows receive the full copy column", () => {
  const multiplayer = renderToStaticMarkup(createElement(MobileMultiplayerSideQuestsScreen, { selectedTab: "community", signedIn: true, officialRows: [], communityRows: [row] }));
  assert.match(multiplayer, /class="sqc-app-row sqc-app-row-with-like text-only"/);
  assert.match(multiplayer, /A complete community Multiplayer title/);
  assert.match(multiplayer, /Community public · 4 players · Final/);

  const css = readFileSync("src/app/mobile-web.css", "utf8");
  assert.match(css, /\.sqc-brand-switch\s*\{[^}]*color:\s*rgba\(255,\s*247,\s*232,\s*\.82\);/);
  assert.match(css, /\.sqc-app-row\.text-only\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-mobile-web\.signed-out\s+\.sqc-app-row\.text-only\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/);
  assert.match(css, /\.sqc-mobile-web:not\(\.signed-out\)\s+:is\(\.sqc-solo-brand-tabs,\s*\.sqc-multiplayer-brand-tabs\)\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
});
