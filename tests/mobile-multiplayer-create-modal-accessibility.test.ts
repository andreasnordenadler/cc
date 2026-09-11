import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readMultiplayerCreateModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function MultiplayerSideQuestsScreen");
  const end = source.indexOf("function OfficialMultiplayerLeaderboardsScreen", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Multiplayer creator modal contains screen-reader navigation", async () => {
  const screen = await readMultiplayerCreateModalSource();

  assert.match(
    screen,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape uses the Multiplayer creator discard guard", async () => {
  const screen = await readMultiplayerCreateModalSource();

  assert.match(
    screen,
    /const createBuilderModalAccessibility = createModalAccessibilityController\(\{[\s\S]*dismiss: closeCreateBuilder,[\s\S]*\}\);/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{createOpen\}[^>]*onRequestClose=\{createBuilderModalAccessibility\.dismiss\}[^>]*>/,
  );
  assert.match(
    screen,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{createBuilderModalAccessibility\.dismiss\}\s*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+[^>]*accessibilityLabel="Close create Multiplayer Side Quest"[^>]*onPress=\{createBuilderModalAccessibility\.dismiss\}[^>]*>/,
  );
});

test("native Multiplayer creator modal moves screen-reader focus to its close button", async () => {
  const screen = await readMultiplayerCreateModalSource();

  assert.match(screen, /const createBuilderCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    screen,
    /const createBuilderModalAccessibility = createModalAccessibilityController\(\{[\s\S]*getInitialFocusTarget: \(\) => createBuilderCloseButtonRef\.current,[\s\S]*findNodeHandle,[\s\S]*setAccessibilityFocus: AccessibilityInfo\.setAccessibilityFocus,[\s\S]*\}\);/,
  );
  assert.match(
    screen,
    /<Modal\s+visible=\{createOpen\}[^>]*onShow=\{createBuilderModalAccessibility\.focusInitial\}[^>]*>/,
  );
  assert.match(
    screen,
    /<Pressable\s+ref=\{createBuilderCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close create Multiplayer Side Quest"/,
  );
});
