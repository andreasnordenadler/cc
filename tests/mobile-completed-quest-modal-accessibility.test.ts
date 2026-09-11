import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCompletedQuestDetailModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function QuestBoardDashboard");
  const dashboardEnd = source.indexOf("function CoatBoardDashboard", dashboardStart);
  const modalStart = source.indexOf(
    "<Modal visible={Boolean(completedQuestRecord && completedDetailChallenge)}",
    dashboardStart,
  );
  const modalEnd = source.indexOf("</Modal>", modalStart);

  assert.notEqual(dashboardStart, -1);
  assert.notEqual(dashboardEnd, -1);
  assert.ok(modalStart > dashboardStart && modalStart < dashboardEnd);
  assert.ok(modalEnd > modalStart && modalEnd < dashboardEnd);
  return {
    dashboard: source.slice(dashboardStart, dashboardEnd),
    modal: source.slice(modalStart, modalEnd + "</Modal>".length),
  };
}

test("native completed Quest Board proof modal contains screen-reader navigation", async () => {
  const { modal } = await readCompletedQuestDetailModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native completed Quest Board proof modal", async () => {
  const { dashboard, modal } = await readCompletedQuestDetailModalSource();

  assert.match(dashboard, /function closeCompletedQuestDetail\(\) \{\s*setCompletedDetailId\(null\);\s*\}/);
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(completedQuestRecord && completedDetailChallenge\)\}[^>]*onRequestClose=\{closeCompletedQuestDetail\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeCompletedQuestDetail\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close completed Side Quest proof"[^>]*onPress=\{closeCompletedQuestDetail\}[^>]*>/,
  );
});

test("native completed Quest Board proof modal moves screen-reader focus to its close button", async () => {
  const { dashboard, modal } = await readCompletedQuestDetailModalSource();

  assert.match(dashboard, /const completedQuestCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    dashboard,
    /function focusCompletedQuestCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(completedQuestCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/,
  );
  assert.match(modal, /<Modal\s[^>]*onShow=\{focusCompletedQuestCloseButton\}[^>]*>/);
  assert.match(
    modal,
    /<Pressable\s+ref=\{completedQuestCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close completed Side Quest proof"/,
  );
});
