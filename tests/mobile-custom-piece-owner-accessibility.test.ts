import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest piece owners expose labeled radio groups", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const groupPattern = /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Whose piece">/g;
  const choicePattern = /<Pressable key=\{owner\} accessibilityRole="radio" accessibilityLabel=\{`Whose piece: \$\{owner === "my" \? "Mine" : "Opponent's"\}`\} accessibilityState=\{\{ checked: selected \}\}/g;

  assert.equal(
    source.match(groupPattern)?.length ?? 0,
    2,
    "Expected both native custom Side Quest builders to expose an owner radio group",
  );
  assert.equal(
    source.match(choicePattern)?.length ?? 0,
    2,
    "Expected both owner-choice loops to announce their group, visible title, and checked state",
  );
  assert.doesNotMatch(
    source,
    /<Pressable key=\{owner\} accessibilityRole="button" accessibilityState=\{\{ selected \}\}/,
  );
});
