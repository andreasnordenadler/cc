import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readRuleLogicChoices() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const marker = "<Text style={compactStyles.multiplayerRuleLabel}>If you add several conditions, how should they count?</Text>";
  const blocks: string[] = [];
  let cursor = 0;

  while (true) {
    const start = source.indexOf(marker, cursor);
    if (start === -1) break;
    const end = source.indexOf("<View style={compactStyles.multiplayerRuleRow}>", start);
    assert.ok(end > start, "Expected each custom rule-logic selector to end before the conditions summary");
    blocks.push(source.slice(start, end));
    cursor = end;
  }

  assert.equal(blocks.length, 2, "Expected both native custom Side Quest builders");
  return blocks;
}

test("native custom Side Quest rule-logic choices expose labeled radio groups", async () => {
  const blocks = await readRuleLogicChoices();

  for (const block of blocks) {
    assert.match(
      block,
      /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="How custom Side Quest conditions count">/,
    );
    assert.match(
      block,
      /const title = logic === "all" \? "Complete every condition" : "Complete any one condition";/,
    );
    assert.match(
      block,
      /const helper = logic === "all" \? "All selected conditions must happen\. You can change this later\." : "One selected condition is enough\. You can change this later\.";/,
    );
    assert.match(
      block,
      /<Pressable key=\{logic\} accessibilityRole="radio" accessibilityLabel=\{`How custom Side Quest conditions count: \$\{title\}\. \$\{helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
    );
    assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected \}\}/);
  }
});
