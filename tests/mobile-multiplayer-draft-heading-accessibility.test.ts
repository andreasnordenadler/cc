import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Multiplayer draft title is exposed as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function MultiplayerSideQuestsScreen(");
  const componentEnd = source.indexOf("function OfficialMultiplayerLeaderboardsScreen(", componentStart);

  assert.notEqual(componentStart, -1, "Expected MultiplayerSideQuestsScreen component");
  assert.notEqual(componentEnd, -1, "Expected OfficialMultiplayerLeaderboardsScreen after MultiplayerSideQuestsScreen");

  const multiplayerScreen = source.slice(componentStart, componentEnd);
  assert.match(
    multiplayerScreen,
    /<Text accessibilityRole="header" style=\{compactStyles\.multiplayerCardTitle\}>Your Multiplayer draft<\/Text>/,
    "the visible Multiplayer draft title must be exposed as a screen-reader heading",
  );
});
