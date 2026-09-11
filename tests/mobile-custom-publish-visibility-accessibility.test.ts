import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom Side Quest publish visibility exposes a labeled radio group", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const marker = '<Text style={compactStyles.multiplayerRuleLabel}>Publish visibility</Text>';
  const start = source.indexOf(marker);
  const end = source.indexOf('accessibilityLabel="Save custom Side Quest"', start);

  assert.equal(source.split(marker).length - 1, 1, "Expected exactly one publish visibility selector");
  assert.ok(start >= 0, "Expected the native custom Side Quest publish visibility selector");
  assert.ok(end > start, "Expected the publish visibility selector before the save action");

  const block = source.slice(start, end);
  assert.equal(
    block.match(/accessibilityRole="radiogroup"/g)?.length ?? 0,
    1,
    "Expected exactly one radio group in the publish visibility selector",
  );
  assert.match(
    block,
    /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Publish visibility">/,
  );
  assert.equal(
    block.match(/accessibilityRole="radio"/g)?.length ?? 0,
    1,
    "Expected exactly one mapped radio template for the two declared choices",
  );
  assert.match(block, /\{\(\["private", "public"\] as const\)\.map\(\(visibility\) => \{/);
  assert.match(block, /const selected = customPublishVisibility === visibility;/);
  assert.match(block, /const title = visibility === "public" \? "Public Community" : "Private Library";/);
  assert.match(
    block,
    /const helper = visibility === "public" \? "Appears in Community Discover and can be picked by other players\." : "Only you can pick it or use it in hosted Multiplayer Side Quests\.";/,
  );
  assert.match(
    block,
    /<Pressable key=\{visibility\} accessibilityRole="radio" accessibilityLabel=\{`Publish visibility: \$\{title\}\. \$\{helper\}`\} accessibilityState=\{\{ checked: selected \}\} style=\{\[compactStyles\.multiplayerOptionCard, selected \? compactStyles\.multiplayerOptionCardSelected : null\]\} onPress=\{\(\) => setCustomPublishVisibility\(visibility\)\}>\s*<View style=\{\[compactStyles\.multiplayerOptionDot, selected \? compactStyles\.multiplayerOptionDotSelected : null\]\} \/>\s*<View style=\{compactStyles\.multiplayerOptionCopy\}>\s*<Text style=\{selected \? compactStyles\.multiplayerOptionTitleSelected : compactStyles\.multiplayerOptionTitle\}>\{title\}<\/Text>\s*<Text style=\{compactStyles\.multiplayerOptionHelper\}>\{helper\}<\/Text>\s*<\/View>\s*<\/Pressable>/,
    "Expected each mapped choice to bind its role, label, checked state, visible copy, styling, and selection handler",
  );
  assert.doesNotMatch(block, /accessibilityRole="button" accessibilityState=\{\{ selected \}\}/);
});
