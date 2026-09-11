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

test("native Solo catalog announces one checked choice in a labeled radio group", async () => {
  const source = await readComponentSource("function QuestBoardDashboard", "function HomeScreen");
  const choiceGroupStart = source.indexOf("<View style={compactStyles.sideQuestBrandTabs}");
  assert.notEqual(choiceGroupStart, -1);
  const choiceGroup = source.slice(
    choiceGroupStart,
    source.indexOf("{sideQuestCatalogTab === \"community\"", choiceGroupStart),
  );

  assert.match(
    choiceGroup,
    /<View style=\{compactStyles\.sideQuestBrandTabs\} accessibilityRole="radiogroup" accessibilityLabel="Solo Side Quest catalogs">/,
  );
  assert.match(
    choiceGroup,
    /accessibilityRole="radio"\s+accessibilityState=\{\{ checked: sideQuestCatalogTab === "official" \}\}\s+accessibilityLabel="Show Official Side Quests"/,
  );
  assert.match(
    choiceGroup,
    /accessibilityRole="radio"\s+accessibilityState=\{\{ checked: sideQuestCatalogTab === "community" \}\}\s+accessibilityLabel="Show Community Side Quests"/,
  );
  assert.doesNotMatch(choiceGroup, /accessibilityRole="tab(?:list)?"|accessibilityState=\{\{ selected:/);
});

test("native Multiplayer catalog announces one checked choice in a labeled radio group", async () => {
  const source = await readComponentSource("function MultiplayerSideQuestsScreen", "function CustomSideQuestDetailModal");
  const choiceGroupStart = source.indexOf("<View style={compactStyles.sideQuestBrandTabs}");
  assert.notEqual(choiceGroupStart, -1);
  const choiceGroup = source.slice(
    choiceGroupStart,
    source.indexOf("<JoinedMultiplayerQuestModal", choiceGroupStart),
  );

  assert.match(
    choiceGroup,
    /<View style=\{compactStyles\.sideQuestBrandTabs\} accessibilityRole="radiogroup" accessibilityLabel="Multiplayer Side Quest catalogs">/,
  );
  assert.match(
    choiceGroup,
    /accessibilityRole="radio"\s+accessibilityState=\{\{ checked: multiplayerCatalogTab === "official" \}\}\s+accessibilityLabel="Show Official Multiplayer Side Quests"/,
  );
  assert.match(
    choiceGroup,
    /accessibilityRole="radio"\s+accessibilityState=\{\{ checked: multiplayerCatalogTab === "community" \}\}\s+accessibilityLabel="Show Community Multiplayer Side Quests"/,
  );
  assert.match(
    choiceGroup,
    /<Pressable\s+accessible=\{false\}\s+accessibilityElementsHidden\s+importantForAccessibility="no-hide-descendants"[\s\S]*?accessibilityRole="button"/,
  );
  assert.doesNotMatch(choiceGroup, /accessibilityRole="tab(?:list)?"|accessibilityState=\{\{ selected:/);
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
