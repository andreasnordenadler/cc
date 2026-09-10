import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Multiplayer disclosures expose their expanded state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const screenStart = source.indexOf("function MultiplayerSideQuestsScreen");
  const screen = source.slice(screenStart);

  assert.notEqual(screenStart, -1);
  assert.match(
    screen,
    /accessibilityLabel="Toggle advanced Multiplayer game settings"\s+accessibilityState=\{\{ expanded: createAdvancedOpen \}\}/,
  );
  assert.match(
    screen,
    /accessibilityLabel="Toggle Multiplayer Side Quest explainer"\s+accessibilityState=\{\{ expanded: multiplayerLearningOpen \}\}/,
  );
});
