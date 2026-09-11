import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCompletedProofModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function TodayDashboard");
  const modalStart = source.indexOf("<Modal visible={Boolean(completedProofRecord && completedProofChallenge)}", dashboardStart);
  const modalEnd = source.indexOf("</Modal>", modalStart);

  assert.notEqual(dashboardStart, -1);
  assert.notEqual(modalStart, -1);
  assert.notEqual(modalEnd, -1);
  return source.slice(dashboardStart, modalEnd + "</Modal>".length);
}

test("native completed Side Quest proof modal contains screen-reader navigation", async () => {
  const modal = await readCompletedProofModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native completed Side Quest proof modal", async () => {
  const modal = await readCompletedProofModalSource();

  assert.match(
    modal,
    /function closeCompletedProof\(\) \{\s*setCompletedProofId\(null\);\s*\}/,
  );
  assert.match(modal, /<Modal\s[^>]*onRequestClose=\{closeCompletedProof\}[^>]*>/);
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeCompletedProof\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close completed Side Quest proof"[^>]*onPress=\{closeCompletedProof\}[^>]*>/,
  );
});

test("native completed Side Quest proof modal moves screen-reader focus to its close button", async () => {
  const modal = await readCompletedProofModalSource();

  assert.match(modal, /const completedProofCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    modal,
    /function focusCompletedProofCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(completedProofCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/,
  );
  assert.match(modal, /<Modal\s[^>]*onShow=\{focusCompletedProofCloseButton\}[^>]*>/);
  assert.match(
    modal,
    /<Pressable\s+ref=\{completedProofCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close completed Side Quest proof"/,
  );
});
