import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest pass conditions expose labeled radio groups", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const groupPattern = /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Pass condition">/g;
  const trueChoicePattern = /<Pressable accessibilityRole="radio" accessibilityLabel="Pass condition: True\. Use for my rook must be on e4\." accessibilityState=\{\{ checked: !customRuleNegated \}\}/g;
  const falseChoicePattern = /<Pressable accessibilityRole="radio" accessibilityLabel="Pass condition: False, must not happen\. Use for my rook must not be on e4\." accessibilityState=\{\{ checked: customRuleNegated \}\}/g;

  assert.equal(
    source.match(groupPattern)?.length ?? 0,
    2,
    "Expected both native custom Side Quest builders to expose a pass-condition radio group",
  );
  assert.equal(
    source.match(trueChoicePattern)?.length ?? 0,
    2,
    "Expected both true choices to announce their group, meaning, and checked state",
  );
  assert.equal(
    source.match(falseChoicePattern)?.length ?? 0,
    2,
    "Expected both false choices to announce their group, meaning, and checked state",
  );
  assert.doesNotMatch(
    source,
    /<Pressable accessibilityRole="button" accessibilityState=\{\{ selected: !?customRuleNegated \}\}/,
  );
});
