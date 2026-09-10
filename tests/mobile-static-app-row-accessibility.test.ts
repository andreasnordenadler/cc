import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getAppRowInteraction } from "../apps/mobile/src/accessibility/appRowInteraction";

test("interactive native app rows expose a button and preserve their action", () => {
  const onPress = () => undefined;

  assert.deepEqual(getAppRowInteraction(onPress), {
    interactive: true,
    accessibilityRole: "button",
    onPress,
  });
});

test("informational native app rows are not exposed as controls", () => {
  assert.deepEqual(getAppRowInteraction(), {
    interactive: false,
    accessibilityRole: undefined,
    onPress: undefined,
  });
});

test("empty Multiplayer standings use informational app rows", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const emptyRows = source.match(/<AppRow title="No leaderboard rows yet"[^>]*\/>/g) ?? [];

  assert.equal(emptyRows.length, 2);
  for (const row of emptyRows) {
    assert.doesNotMatch(row, /onPress=/);
  }
});
