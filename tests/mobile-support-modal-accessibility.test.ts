import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readHelpSupportModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function HelpSupportModal");
  const end = source.indexOf("function CommunityMultiplayerReportModal", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Help and Support modal contains screen-reader navigation", async () => {
  const modal = await readHelpSupportModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native Help and Support modal", async () => {
  const modal = await readHelpSupportModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{onClose\}\s*>/,
  );
});

test("native Help and Support modal moves screen-reader focus to its close button", async () => {
  const modal = await readHelpSupportModalSource();

  assert.match(modal, /const closeButtonRef = useRef<View>\(null\)/);
  assert.match(
    modal,
    /function focusCloseButton\(\)[\s\S]*findNodeHandle\(closeButtonRef\.current\)[\s\S]*AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\)/,
  );
  assert.match(modal, /<Modal\s[^>]*onShow=\{focusCloseButton\}[^>]*>/);
  assert.match(
    modal,
    /<Pressable\s+ref=\{closeButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close Help and Support"/,
  );
});
