import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCustomSideQuestDetailModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function CustomSideQuestDetailModal");
  const end = source.indexOf("function CompletedQuestProofCard", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native custom Side Quest detail modal contains screen-reader navigation", async () => {
  const modal = await readCustomSideQuestDetailModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native custom Side Quest detail modal", async () => {
  const modal = await readCustomSideQuestDetailModalSource();

  assert.match(modal, /<Modal\s[^>]*onRequestClose=\{onClose\}[^>]*>/);
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{onClose\}\s*>/,
  );
});

test("native custom Side Quest detail modal moves screen-reader focus to its close button", async () => {
  const modal = await readCustomSideQuestDetailModalSource();

  assert.match(modal, /const closeButtonRef = useRef<View>\(null\)/);
  assert.match(
    modal,
    /function focusCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(closeButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/,
  );
  assert.match(modal, /<Modal\s[^>]*onShow=\{focusCloseButton\}[^>]*>/);
  assert.match(
    modal,
    /<Pressable\s+ref=\{closeButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close custom Side Quest detail"/,
  );
});
