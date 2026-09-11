import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest timings expose labeled radio groups", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const groupPattern = /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Timing">/g;
  const choicePattern = /<Pressable accessibilityRole="radio" accessibilityLabel=\{`Timing: \$\{titleCaseRuleValue\(timing\)\}`\} accessibilityState=\{\{ checked: selected \}\}/g;

  assert.equal(
    source.match(groupPattern)?.length ?? 0,
    2,
    "Expected both native custom Side Quest builders to expose a timing radio group",
  );
  assert.equal(
    source.match(choicePattern)?.length ?? 0,
    2,
    "Expected both timing-choice loops to announce their group, visible title, and checked state",
  );
  assert.doesNotMatch(
    source,
    /<Pressable accessibilityRole="button" accessibilityState=\{\{ selected \}\} style=\{compactStyles\.customTimingChoiceHeader\}/,
  );
});
