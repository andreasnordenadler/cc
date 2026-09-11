import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readGameResultChoices() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const marker = "<Text style={compactStyles.multiplayerRuleLabel}>Result</Text>";
  const endMarker = "<Text style={styles.microcopy}>Result is checked from your linked chess account’s perspective.</Text>";
  const blocks: string[] = [];
  let cursor = 0;

  while (true) {
    const start = source.indexOf(marker, cursor);
    if (start === -1) break;
    const end = source.indexOf(endMarker, start);
    assert.ok(end > start, "Expected each game-result selector to end before its helper copy");
    blocks.push(source.slice(start, end));
    cursor = end + endMarker.length;
  }

  assert.equal(blocks.length, 2, "Expected both native custom Side Quest builders");
  return blocks;
}

test("native custom Side Quest game results expose labeled radio groups", async () => {
  const blocks = await readGameResultChoices();

  for (const block of blocks) {
    assert.match(
      block,
      /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Game result">/,
    );
    assert.match(
      block,
      /<Pressable key=\{result\} accessibilityRole="radio" accessibilityLabel=\{`Game result: \$\{titleCaseRuleValue\(result\)\}`\} accessibilityState=\{\{ checked: selected \}\}/,
    );
    assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected \}\}/);
  }
});
