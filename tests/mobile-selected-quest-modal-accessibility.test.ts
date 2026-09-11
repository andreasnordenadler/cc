import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readSelectedQuestDetailModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function QuestBoardDashboard");
  const dashboardEnd = source.indexOf("function CoatBoardDashboard", dashboardStart);
  const modalStart = source.indexOf("<Modal visible={Boolean(detailChallenge)}", dashboardStart);
  const modalEnd = source.indexOf("</Modal>", modalStart);

  assert.notEqual(dashboardStart, -1);
  assert.notEqual(dashboardEnd, -1);
  assert.ok(modalStart > dashboardStart && modalStart < dashboardEnd);
  assert.ok(modalEnd > modalStart && modalEnd < dashboardEnd);
  return source.slice(dashboardStart, modalEnd + "</Modal>".length);
}

test("native selected Side Quest modal contains screen-reader navigation", async () => {
  const modal = await readSelectedQuestDetailModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native selected Side Quest modal", async () => {
  const modal = await readSelectedQuestDetailModalSource();

  assert.match(modal, /function closeSelectedQuestDetail\(\) \{\s*setDetailChallengeId\(null\);\s*\}/);
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(detailChallenge\)\}[^>]*onRequestClose=\{closeSelectedQuestDetail\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeSelectedQuestDetail\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityRole="button"\s+accessibilityLabel="Close Side Quest details"[^>]*onPress=\{closeSelectedQuestDetail\}[^>]*>/,
  );
});

test("native selected Side Quest modal moves screen-reader focus to its close button", async () => {
  const modal = await readSelectedQuestDetailModalSource();

  assert.match(modal, /const selectedQuestCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    modal,
    /function focusSelectedQuestCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(selectedQuestCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(detailChallenge\)\}[^>]*onShow=\{focusSelectedQuestCloseButton\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{selectedQuestCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close Side Quest details"/,
  );
});
