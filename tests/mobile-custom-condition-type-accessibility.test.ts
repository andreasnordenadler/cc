import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readConditionTypeChoices() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const marker = "<Text style={compactStyles.multiplayerRuleLabel}>Condition type</Text>";
  const blocks: string[] = [];
  let cursor = 0;

  while (true) {
    const start = source.indexOf(marker, cursor);
    if (start === -1) break;
    const end = source.indexOf("{customConditionUsesPiece(customRuleCondition)", start);
    assert.ok(end > start, "Expected each condition-type selector to end before piece choices");
    blocks.push(source.slice(start, end));
    cursor = end;
  }

  assert.equal(blocks.length, 2, "Expected both native custom Side Quest builders");
  return blocks;
}

test("native custom Side Quest condition types expose labeled radio groups", async () => {
  const blocks = await readConditionTypeChoices();

  for (const block of blocks) {
    assert.match(
      block,
      /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Condition type">/,
    );
    assert.match(
      block,
      /<Pressable key=\{condition\} accessibilityRole="radio" accessibilityLabel=\{`Condition type: \$\{copy\.title\}\. \$\{copy\.helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
    );
    assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected \}\}/);
  }
});
