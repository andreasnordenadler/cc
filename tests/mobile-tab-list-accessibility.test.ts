import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readComponentSource(startMarker: string, endMarker: string) {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Solo catalog exposes its choices as one labeled tab list", async () => {
  const source = await readComponentSource("function QuestBoardDashboard", "function HomeScreen");
  const tabGroupStart = source.indexOf("<View style={compactStyles.sideQuestBrandTabs}");
  assert.notEqual(tabGroupStart, -1);
  const tabGroup = source.slice(
    tabGroupStart,
    source.indexOf("{sideQuestCatalogTab === \"community\"", tabGroupStart),
  );

  assert.match(
    tabGroup,
    /<View style=\{compactStyles\.sideQuestBrandTabs\} accessibilityRole="tablist" accessibilityLabel="Solo Side Quest catalogs">/,
  );
  assert.match(
    tabGroup,
    /<Pressable\s+accessible=\{false\}\s+accessibilityElementsHidden\s+importantForAccessibility="no-hide-descendants"[\s\S]*?accessibilityRole="button"/,
  );
});

test("native Multiplayer catalog exposes its choices as one labeled tab list", async () => {
  const source = await readComponentSource("function MultiplayerSideQuestsScreen", "function CustomSideQuestDetailModal");
  const tabGroupStart = source.indexOf("<View style={compactStyles.sideQuestBrandTabs}");
  assert.notEqual(tabGroupStart, -1);
  const tabGroup = source.slice(
    tabGroupStart,
    source.indexOf("<JoinedMultiplayerQuestModal", tabGroupStart),
  );

  assert.match(
    tabGroup,
    /<View style=\{compactStyles\.sideQuestBrandTabs\} accessibilityRole="tablist" accessibilityLabel="Multiplayer Side Quest catalogs">/,
  );
  assert.match(
    tabGroup,
    /<Pressable\s+accessible=\{false\}\s+accessibilityElementsHidden\s+importantForAccessibility="no-hide-descendants"[\s\S]*?accessibilityRole="button"/,
  );
});

test("native Multiplayer creator source picker exposes one labeled tab list", async () => {
  const source = await readComponentSource("function MultiplayerSideQuestsScreen", "function CustomSideQuestDetailModal");
  const creatorStart = source.indexOf("<Text style={compactStyles.multiplayerCardEyebrow}>Add from catalog</Text>");
  assert.notEqual(creatorStart, -1);
  const tabGroupStart = source.indexOf("<View style={compactStyles.sideQuestBrandTabs}", creatorStart);
  assert.notEqual(tabGroupStart, -1);
  const tabGroup = source.slice(
    tabGroupStart,
    source.indexOf("{visibleCreateQuestChoices.length", tabGroupStart),
  );

  assert.match(
    tabGroup,
    /<View style=\{compactStyles\.sideQuestBrandTabs\} accessibilityRole="tablist" accessibilityLabel="Multiplayer creator Side Quest sources">/,
  );
  assert.match(
    tabGroup,
    /<Pressable\s+accessible=\{false\}\s+accessibilityElementsHidden\s+importantForAccessibility="no-hide-descendants"[\s\S]*?accessibilityRole="button"/,
  );
});

test("native bottom navigation exposes its tabs as one labeled tab list", async () => {
  const source = await readComponentSource("function BottomNav", "function ActiveScreen");

  assert.match(
    source,
    /<View style=\{\[styles\.bottomNavBar, \{ paddingBottom: Math\.max\(bottomInset, 0\) \}]} accessibilityRole="tablist" accessibilityLabel="Primary app navigation">/,
  );
  assert.match(source, /\{TABS\.map\(\(tab\) => \([\s\S]*?accessibilityRole="tab"[\s\S]*?accessibilityState=\{\{ selected: activeTab === tab\.id \}\}/);
});
