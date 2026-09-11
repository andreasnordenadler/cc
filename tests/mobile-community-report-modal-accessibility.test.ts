import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCommunityReportModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function CommunityMultiplayerReportModal");
  const end = source.indexOf("function HelpSupportRow", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Community Multiplayer report modal contains screen-reader navigation", async () => {
  const modal = await readCommunityReportModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the Community Multiplayer report modal only while idle", async () => {
  const modal = await readCommunityReportModalSource();

  assert.match(
    modal,
    /const reportModalAccessibility = createModalAccessibilityController\(\{[\s\S]*dismiss: onClose,[\s\S]*canDismiss: \(\) => !submitState\.busy,[\s\S]*\}\);/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{visible\}[^>]*onRequestClose=\{reportModalAccessibility\.dismiss\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{reportModalAccessibility\.dismiss\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close Community Multiplayer report"[^>]*onPress=\{reportModalAccessibility\.dismiss\}[^>]*>/,
  );
});

test("native Community Multiplayer report modal moves screen-reader focus to its close button", async () => {
  const modal = await readCommunityReportModalSource();

  assert.match(modal, /const closeButtonRef = useRef<View>\(null\)/);
  assert.match(
    modal,
    /function focusCloseButton\(\)[\s\S]*findNodeHandle\(closeButtonRef\.current\)[\s\S]*AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\)/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{visible\}[^>]*onShow=\{focusCloseButton\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{closeButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close Community Multiplayer report"/,
  );
});
