import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("mobile latest official results exposes its section heading", () => {
  const source = readFileSync(resolve(process.cwd(), "apps/mobile/App.tsx"), "utf8");
  const screenStart = source.indexOf("function MultiplayerSideQuestsScreen");
  const screenEnd = source.indexOf("function OfficialMultiplayerLeaderboardsScreen", screenStart);

  assert.ok(screenStart >= 0 && screenEnd > screenStart, "the Multiplayer Side Quests screen must be present");
  assert.match(
    source.slice(screenStart, screenEnd),
    /<Text accessibilityRole="header" style=\{styles\.sectionTitle\}>Gold, silver, bronze\.<\/Text>/,
    "the latest official results card must expose its visible section title as a heading",
  );
});
