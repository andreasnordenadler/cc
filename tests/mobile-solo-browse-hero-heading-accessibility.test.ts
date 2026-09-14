import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Solo Side Quest browse hero exposes its visible title as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function SideQuestsScreen(");
  const end = source.indexOf("function MultiplayerSideQuestsScreen(", start);

  assert.notEqual(start, -1, "Expected SideQuestsScreen");
  assert.notEqual(end, -1, "Expected the next screen after SideQuestsScreen");

  const dashboard = source.slice(start, end);
  assert.match(
    dashboard,
    /<Text accessibilityRole="header" style=\{styles\.soloBrowseHeroTitle\}>Choose your next Side Quest<\/Text>/,
    "the Solo Side Quest browse hero must expose its visible title as a heading",
  );
});
