import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Multiplayer creator empty catalog exposes its visible title as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function MultiplayerSideQuestsScreen(");
  const componentEnd = source.indexOf("function OfficialMultiplayerLeaderboardsScreen(", componentStart);
  const multiplayerScreen = source.slice(componentStart, componentEnd);

  assert.notEqual(componentStart, -1, "Expected MultiplayerSideQuestsScreen component");
  assert.notEqual(componentEnd, -1, "Expected OfficialMultiplayerLeaderboardsScreen after MultiplayerSideQuestsScreen");
  assert.match(
    multiplayerScreen,
    /<Text accessibilityRole="header" style=\{compactStyles\.communityEmptyTitle\}>\{createQuestSearch \|\| createShowSelectedOnly \? "No matching Side Quests" : createQuestSourceTab === "official" \? "No official Side Quests" : "No community-created Side Quests"\}<\/Text>/,
    "the visible empty creator-catalog title must be exposed as a screen-reader heading",
  );
});
