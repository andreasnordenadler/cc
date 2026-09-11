import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Multiplayer create catalog view filters expose one labeled radio group", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<Text style={compactStyles.multiplayerCardTitle}>Browse like Community Side Quests.</Text>");
  const end = source.indexOf("<View style={compactStyles.sideQuestBrandTabs}", start);

  assert.ok(start >= 0, "Expected the native Multiplayer create catalog");
  assert.ok(end > start, "Expected the catalog view filters before the source tabs");

  const block = source.slice(start, end);
  assert.equal(
    block.match(/accessibilityRole="radiogroup"/g)?.length ?? 0,
    1,
    "Expected exactly one radio group for the catalog view filters",
  );
  assert.match(
    block,
    /<View style=\{compactStyles\.createFilterRow\} accessibilityRole="radiogroup" accessibilityLabel="Multiplayer creator catalog view">/,
  );
  assert.match(
    block,
    /<Pressable accessibilityRole="radio" accessibilityLabel="Multiplayer creator catalog view: Browse" accessibilityState=\{\{ checked: !createShowSelectedOnly \}\} style=\{\[compactStyles\.createFilterChip, !createShowSelectedOnly \? compactStyles\.createFilterChipActive : null\]\} onPress=\{\(\) => setCreateShowSelectedOnly\(false\)\}>\s*<Text style=\{\[compactStyles\.createFilterChipText, !createShowSelectedOnly \? compactStyles\.createFilterChipTextActive : null\]\}>Browse<\/Text>\s*<\/Pressable>/,
    "Expected Browse to expose its label, checked state, styling, and handler",
  );
  assert.match(
    block,
    /<Pressable accessibilityRole="radio" accessibilityLabel=\{`Multiplayer creator catalog view: Selected \(\$\{createQuestIds\.length\}\)`\} accessibilityState=\{\{ checked: createShowSelectedOnly \}\} style=\{\[compactStyles\.createFilterChip, createShowSelectedOnly \? compactStyles\.createFilterChipActive : null\]\} onPress=\{\(\) => setCreateShowSelectedOnly\(true\)\}>\s*<Text style=\{\[compactStyles\.createFilterChipText, createShowSelectedOnly \? compactStyles\.createFilterChipTextActive : null\]\}>Selected \(\{createQuestIds\.length\}\)<\/Text>\s*<\/Pressable>/,
    "Expected Selected to expose its dynamic label, checked state, styling, and handler",
  );
  assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected:/);
});
