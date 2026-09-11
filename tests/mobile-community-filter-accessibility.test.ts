import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Community Side Quest filters expose one labeled radio group", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<Text style={compactStyles.freshSectionTitle}>Community Side Quests</Text>");
  const end = source.indexOf("<Pressable accessibilityRole=\"button\" accessibilityLabel=\"Change community sort\"", start);

  assert.ok(start >= 0, "Expected the native Community Side Quest catalog");
  assert.ok(end > start, "Expected the community filters before the sort control");

  const block = source.slice(start, end);
  assert.equal(
    block.match(/accessibilityRole="radiogroup"/g)?.length ?? 0,
    1,
    "Expected exactly one radio group for the community filters",
  );
  assert.match(
    block,
    /<ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator=\{false\} contentContainerStyle=\{compactStyles\.communityChipRow\} accessibilityRole="radiogroup" accessibilityLabel="Community Side Quest filters">/,
  );
  assert.match(block, /\{\(\["all", "popular", "new", "completed"\] as CommunityBrowseFilter\[\]\)\.map\(\(filter\) => \{/);
  assert.match(block, /const selected = communityFilter === filter;/);
  assert.match(block, /const label = filter === "all" \? "All" : filter === "popular" \? "Popular" : filter === "new" \? "New" : "Completed";/);
  assert.match(
    block,
    /<Pressable key=\{filter\} accessibilityRole="radio" accessibilityLabel=\{`Community Side Quest filter: \$\{label\}`\} accessibilityState=\{\{ checked: selected \}\} style=\{\[compactStyles\.communityChip, selected && compactStyles\.communityChipActive\]\} onPress=\{\(\) => setCommunityFilter\(filter\)\}>\s*<Text style=\{\[compactStyles\.communityChipText, selected && compactStyles\.communityChipTextActive\]\}>\{label\}<\/Text>\s*<\/Pressable>/,
    "Expected each mapped filter to bind its label, checked state, styling, and handler",
  );
  assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected: communityFilter === filter \}\}/);
});
