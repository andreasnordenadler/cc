import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest library filters expose one labeled radio group", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<Text style={compactStyles.freshSectionTitle}>My Custom Side Quests</Text>");
  const end = source.indexOf("{filteredCustomDrafts.length ? (", start);

  assert.ok(start >= 0, "Expected the native custom Side Quest library");
  assert.ok(end > start, "Expected the library filters before the filtered results");

  const block = source.slice(start, end);
  assert.equal(
    block.match(/accessibilityRole="radiogroup"/g)?.length ?? 0,
    1,
    "Expected exactly one radio group for the library filters",
  );
  assert.match(
    block,
    /<ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator=\{false\} contentContainerStyle=\{compactStyles\.communityChipRow\} accessibilityRole="radiogroup" accessibilityLabel="My Custom Side Quest filters">/,
  );
  assert.match(block, /\{\(\["all", "published", "drafts", "public", "archived"\] as CustomLibraryFilter\[\]\)\.map\(\(filter\) => \{/);
  assert.match(block, /const selected = customLibraryFilter === filter;/);
  assert.match(block, /const label = filter === "all" \? "All" : filter === "drafts" \? "Drafts" : filter === "public" \? "Public" : filter === "archived" \? "Archived" : "Published";/);
  assert.match(
    block,
    /<Pressable key=\{filter\} accessibilityRole="radio" accessibilityLabel=\{`My Custom Side Quest filter: \$\{label\}`\} accessibilityState=\{\{ checked: selected \}\} style=\{\[compactStyles\.communityChip, selected && compactStyles\.communityChipActive\]\} onPress=\{\(\) => setCustomLibraryFilter\(filter\)\}>\s*<Text style=\{\[compactStyles\.communityChipText, selected && compactStyles\.communityChipTextActive\]\}>\{label\}<\/Text>\s*<\/Pressable>/,
    "Expected each mapped filter to bind its label, checked state, styling, and handler",
  );
  assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected: customLibraryFilter === filter \}\}/);
});
