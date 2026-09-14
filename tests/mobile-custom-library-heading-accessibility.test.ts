import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest library title is exposed as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function SideQuestsScreen(");
  const componentEnd = source.indexOf("function MultiplayerSideQuestsScreen(", componentStart);

  assert.notEqual(componentStart, -1, "Expected SideQuestsScreen component");
  assert.notEqual(componentEnd, -1, "Expected MultiplayerSideQuestsScreen after SideQuestsScreen");

  const soloScreen = source.slice(componentStart, componentEnd);
  assert.match(
    soloScreen,
    /<Text accessibilityRole="header" style=\{compactStyles\.multiplayerCardTitle\}>Your custom Side Quest library\.<\/Text>/,
    "the visible custom-library title must be exposed as a screen-reader heading",
  );
});
