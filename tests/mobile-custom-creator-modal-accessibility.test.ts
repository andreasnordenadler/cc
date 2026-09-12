import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCustomCreatorModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function QuestBoardDashboard");
  const end = source.indexOf("function CoatBoardDashboard", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Custom Solo creator modal contains screen-reader navigation", async () => {
  const screen = await readCustomCreatorModalSource();

  assert.match(
    screen,
    /<Modal\s+visible=\{customCreateOpen\}[^>]*>\s*<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape uses the Custom Solo creator discard guard", async () => {
  const screen = await readCustomCreatorModalSource();

  assert.match(
    screen,
    /const customBuilderModalAccessibility = createModalAccessibilityController\(\{[\s\S]*dismiss: closeCustomBuilder,[\s\S]*\}\);/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{customCreateOpen\}[^>]*onRequestClose=\{customBuilderModalAccessibility\.dismiss\}[^>]*>/,
  );
  assert.match(
    screen,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{customBuilderModalAccessibility\.dismiss\}\s*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+[^>]*accessibilityLabel="Close custom Side Quest builder"[^>]*onPress=\{customBuilderModalAccessibility\.dismiss\}[^>]*>/,
  );
});

test("native Custom Solo creator modal moves screen-reader focus to its close button", async () => {
  const screen = await readCustomCreatorModalSource();

  assert.match(screen, /const customBuilderCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    screen,
    /const customBuilderModalAccessibility = createModalAccessibilityController\(\{[\s\S]*getInitialFocusTarget: \(\) => customBuilderCloseButtonRef\.current,[\s\S]*findNodeHandle,[\s\S]*setAccessibilityFocus: AccessibilityInfo\.setAccessibilityFocus,[\s\S]*\}\);/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{customCreateOpen\}[^>]*onShow=\{customBuilderModalAccessibility\.focusInitial\}[^>]*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+ref=\{customBuilderCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close custom Side Quest builder"/,
  );
});

test("native Custom Solo creator title exposes a screen-reader heading on the rendered Side Quests route", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const screen = await readCustomCreatorModalSource();
  const activeScreenStart = source.indexOf("function ActiveScreen(");
  const activeScreenEnd = source.indexOf("function SideQuestsScreen(", activeScreenStart);

  assert.notEqual(activeScreenStart, -1, "Expected ActiveScreen");
  assert.notEqual(activeScreenEnd, -1, "Expected the next component after ActiveScreen");
  assert.match(
    source.slice(activeScreenStart, activeScreenEnd),
    /case "sideQuests":\s+return <QuestBoardDashboard\b/,
  );
  assert.match(
    screen,
    /<Text accessibilityRole="header" style=\{compactStyles\.detailTitle\}>\{customEditingQuestId \? "Edit your Side Quest\." : "Build your Side Quest\."\}<\/Text>/,
  );
});
