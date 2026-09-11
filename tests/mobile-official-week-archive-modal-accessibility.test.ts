import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readOfficialWeekArchiveModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function OfficialMultiplayerLeaderboardsScreen");
  const componentEnd = source.indexOf("function getChallengesByIds", componentStart);
  const modalStart = source.indexOf(
    "<Modal visible={Boolean(selectedWeek)}",
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

test("native official week archive modal contains screen-reader navigation", async () => {
  const { modal } = await readOfficialWeekArchiveModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native official week archive modal", async () => {
  const { component, modal } = await readOfficialWeekArchiveModalSource();

  assert.match(
    component,
    /function closeSelectedWeekArchive\(\) \{\s*setSelectedWeekId\(null\);\s*\}/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(selectedWeek\)\}[^>]*onRequestClose=\{closeSelectedWeekArchive\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeSelectedWeekArchive\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close official weekly results"[^>]*onPress=\{closeSelectedWeekArchive\}[^>]*>/,
  );
});

test("native official week archive modal moves screen-reader focus to its close button", async () => {
  const { component, modal } = await readOfficialWeekArchiveModalSource();

  assert.match(component, /const selectedWeekArchiveCloseButtonRef = useRef<View>\(null\)/);
  const focusHandlerPattern = /function focusSelectedWeekArchiveCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(selectedWeekArchiveCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/;
  assert.match(component, focusHandlerPattern);
  assert.doesNotMatch(
    `function focusSelectedWeekArchiveCloseButton() {}\nfunction unusedDecoy() {\n  const nodeHandle = findNodeHandle(selectedWeekArchiveCloseButtonRef.current);\n  if (nodeHandle !== null) AccessibilityInfo.setAccessibilityFocus(nodeHandle);\n}`,
    focusHandlerPattern,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(selectedWeek\)\}[^>]*onShow=\{focusSelectedWeekArchiveCloseButton\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{selectedWeekArchiveCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close official weekly results"/,
  );
});
