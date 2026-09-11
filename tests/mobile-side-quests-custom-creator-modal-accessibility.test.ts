import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readSideQuestsCustomCreatorModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function SideQuestsScreen");
  const end = source.indexOf("function MultiplayerSideQuestsScreen", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Side Quests custom creator modal contains screen-reader navigation", async () => {
  const screen = await readSideQuestsCustomCreatorModalSource();

  assert.match(
    screen,
    /<Modal\s+visible=\{customCreateOpen\}[^>]*>\s*<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape uses the Side Quests custom creator discard guard", async () => {
  const screen = await readSideQuestsCustomCreatorModalSource();

  assert.match(
    screen,
    /<Modal\s+visible=\{customCreateOpen\}[^>]*onRequestClose=\{closeCustomBuilder\}[^>]*>/,
  );
  assert.match(
    screen,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeCustomBuilder\}\s*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+[^>]*accessibilityLabel="Close custom Side Quest builder"[^>]*onPress=\{closeCustomBuilder\}[^>]*>/,
  );
});

test("native Side Quests custom creator moves screen-reader focus to its close button", async () => {
  const screen = await readSideQuestsCustomCreatorModalSource();

  assert.match(screen, /const customBuilderCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    screen,
    /function focusCustomBuilderCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(customBuilderCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{customCreateOpen\}[^>]*onShow=\{focusCustomBuilderCloseButton\}[^>]*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+ref=\{customBuilderCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close custom Side Quest builder"/,
  );
});
