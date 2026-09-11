import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readMultiplayerRuleQuestModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function JoinedMultiplayerQuestModal");
  const componentEnd = source.indexOf("function MultiplayerLeaderboardRow", componentStart);
  const modalStart = source.indexOf(
    "<Modal visible={Boolean(selectedRuleQuest)}",
    componentStart,
  );
  const modalEnd = source.indexOf("</Modal>", modalStart);

  assert.notEqual(componentStart, -1);
  assert.notEqual(componentEnd, -1);
  assert.ok(modalStart > componentStart && modalStart < componentEnd);
  assert.ok(modalEnd > modalStart && modalEnd < componentEnd);
  return {
    component: source.slice(componentStart, componentEnd),
    modal: source.slice(modalStart, modalEnd + "</Modal>".length),
  };
}

test("native Multiplayer Side Quest rules modal contains screen-reader navigation", async () => {
  const { modal } = await readMultiplayerRuleQuestModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native Multiplayer Side Quest rules modal", async () => {
  const { component, modal } = await readMultiplayerRuleQuestModalSource();

  assert.match(
    component,
    /function closeSelectedRuleQuest\(\) \{\s*setSelectedRuleQuestTitle\(null\);\s*\}/,
  );
  assert.match(
    component,
    /const selectedRuleQuestAccessibility = createModalAccessibilityController\(\{\s*dismiss: closeSelectedRuleQuest,/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(selectedRuleQuest\)\}[^>]*onRequestClose=\{selectedRuleQuestAccessibility\.dismiss\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{selectedRuleQuestAccessibility\.dismiss\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close multiplayer quest rules"[^>]*onPress=\{selectedRuleQuestAccessibility\.dismiss\}[^>]*>/,
  );
});

test("native Multiplayer Side Quest rules modal moves screen-reader focus to its close button", async () => {
  const { component, modal } = await readMultiplayerRuleQuestModalSource();

  assert.match(component, /const selectedRuleQuestCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    component,
    /const selectedRuleQuestAccessibility = createModalAccessibilityController\(\{[\s\S]*getInitialFocusTarget: \(\) => selectedRuleQuestCloseButtonRef\.current,[\s\S]*findNodeHandle,[\s\S]*setAccessibilityFocus: AccessibilityInfo\.setAccessibilityFocus,[\s\S]*\}\);/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(selectedRuleQuest\)\}[^>]*onShow=\{selectedRuleQuestAccessibility\.focusInitial\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{selectedRuleQuestCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close multiplayer quest rules"/,
  );
});
