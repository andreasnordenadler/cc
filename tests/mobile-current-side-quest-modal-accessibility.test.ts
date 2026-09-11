import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCurrentSideQuestDetailModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function CurrentSideQuestDetailModal");
  const end = source.indexOf("function DetailRow", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native current Side Quest modal contains screen-reader navigation", async () => {
  const modal = await readCurrentSideQuestDetailModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native current Side Quest modal", async () => {
  const modal = await readCurrentSideQuestDetailModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{onClose\}\s*>/,
  );
});

test("native current Side Quest modal moves screen-reader focus to its close button", async () => {
  const modal = await readCurrentSideQuestDetailModalSource();

  assert.match(modal, /const closeButtonRef = useRef<View>\(null\)/);
  assert.match(
    modal,
    /function focusCloseButton\(\)[\s\S]*findNodeHandle\(closeButtonRef\.current\)[\s\S]*AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\)/,
  );
  assert.match(modal, /<Modal\s[^>]*onShow=\{focusCloseButton\}[^>]*>/);
  assert.match(
    modal,
    /<Pressable\s+ref=\{closeButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close Current Active Side Quest"/,
  );
});
