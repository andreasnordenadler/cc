import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Community Multiplayer filters expose one labeled radio group", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<View style={styles.groupquestsActiveCard} accessibilityLabel=\"Community Multiplayer Side Quests\">");
  const end = source.indexOf("<Pressable accessibilityRole=\"button\" accessibilityLabel=\"Change multiplayer community sort\"", start);

  assert.ok(start >= 0, "Expected the native Community Multiplayer catalog");
  assert.ok(end > start, "Expected the Community Multiplayer filters before the sort control");

  const block = source.slice(start, end);
  assert.equal(
    block.match(/accessibilityRole="radiogroup"/g)?.length ?? 0,
    1,
    "Expected exactly one radio group for the Community Multiplayer filters",
  );
  assert.match(
    block,
    /<ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator=\{false\} contentContainerStyle=\{compactStyles\.communityChipRow\} accessibilityRole="radiogroup" accessibilityLabel="Community Multiplayer Side Quest filters">/,
  );
  assert.match(
    block,
    /\{\(isSignedOutBrowse \? \(\["open", "all"\] as MultiplayerCommunityFilter\[\]\) : \(\["open", "all", "joined", "hosted", "finished"\] as MultiplayerCommunityFilter\[\]\)\)\.map\(\(filter\) => \{/,
  );
  assert.match(block, /const selected = multiplayerCommunityFilter === filter;/);
  assert.match(block, /const label = filter === "all" \? "All" : filter === "open" \? "Open" : filter === "joined" \? "Joined" : filter === "hosted" \? "Hosted" : "Finished";/);
  assert.match(
    block,
    /<Pressable key=\{filter\} accessibilityRole="radio" accessibilityLabel=\{`Community Multiplayer Side Quest filter: \$\{label\}`\} accessibilityState=\{\{ checked: selected \}\} style=\{\[compactStyles\.communityChip, selected && compactStyles\.communityChipActive\]\} onPress=\{\(\) => setMultiplayerCommunityFilter\(filter\)\}>\s*<Text style=\{\[compactStyles\.communityChipText, selected && compactStyles\.communityChipTextActive\]\}>\{label\}<\/Text>\s*<\/Pressable>/,
    "Expected each mapped filter to bind its label, checked state, styling, and handler",
  );
  assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected: multiplayerCommunityFilter === filter \}\}/);
});
