import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readPieceChoices() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const marker = "<Text style={compactStyles.multiplayerRuleLabel}>Piece</Text>";
  const blocks: string[] = [];
  let cursor = 0;

  while (true) {
    const start = source.indexOf(marker, cursor);
    if (start === -1) break;
    const end = source.indexOf(
      "<Text style={compactStyles.multiplayerRuleLabel}>Whose piece</Text>",
      start,
    );
    assert.ok(end > start, "Expected each piece selector to end before owner choices");
    blocks.push(source.slice(start, end));
    cursor = end;
  }

  assert.equal(blocks.length, 2, "Expected both native custom Side Quest builders");
  return blocks;
}

test("native custom Side Quest piece types expose labeled radio groups", async () => {
  const blocks = await readPieceChoices();

  for (const block of blocks) {
    assert.match(
      block,
      /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Piece">/,
    );
    assert.match(
      block,
      /<Pressable accessibilityRole="radio" accessibilityLabel=\{`Piece: \$\{titleCaseRuleValue\(piece\)\}\$\{piece === "king" \|\| piece === "queen" \? "\. Only one exists, so there is no which one choice\." : ""\}`\} accessibilityState=\{\{ checked: selected \}\}/,
    );
    assert.doesNotMatch(
      block,
      /<Pressable accessibilityRole="button" accessibilityState=\{\{ selected \}\}/,
    );
  }
});
