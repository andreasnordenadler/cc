import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest saved-condition actions name their target condition", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const actions = ["Edit", "Duplicate", "Delete"] as const;

  for (const action of actions) {
    const targetedLabel = new RegExp(
      "accessibilityLabel=\\{`" + action + " \\$\\{getCustomConditionLabel\\(index\\)\\}`\\}",
      "g",
    );
    assert.equal(
      source.match(targetedLabel)?.length ?? 0,
      2,
      `Expected both native custom builders to name the condition targeted by ${action.toLowerCase()}`,
    );
    assert.doesNotMatch(
      source,
      new RegExp(`accessibilityLabel="${action} saved condition"`),
      `Generic ${action.toLowerCase()} labels do not distinguish repeated saved conditions`,
    );
  }
});
