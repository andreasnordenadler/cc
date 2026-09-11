import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readActiveCoatLightboxSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function CurrentSideQuestDetailModal");
  const componentEnd = source.indexOf("function DetailRow", componentStart);
  const modalStart = source.indexOf("<Modal visible={coatExpanded}", componentStart);
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

test("native active Coat of Arms lightbox contains screen-reader navigation", async () => {
  const { modal } = await readActiveCoatLightboxSource();

  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityViewIsModal[^>]*accessibilityLabel="Close enlarged Coat of Arms"[^>]*>/,
  );
});

test("accessibility escape closes the native active Coat of Arms lightbox", async () => {
  const { component, modal } = await readActiveCoatLightboxSource();

  assert.match(
    component,
    /function closeActiveCoatLightbox\(\) \{\s*setCoatExpanded\(false\);\s*\}/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{coatExpanded\}[^>]*onRequestClose=\{closeActiveCoatLightbox\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityViewIsModal[^>]*onAccessibilityEscape=\{closeActiveCoatLightbox\}[^>]*onPress=\{closeActiveCoatLightbox\}[^>]*>/,
  );
});

test("native active Coat of Arms lightbox moves screen-reader focus to its close target", async () => {
  const { component, modal } = await readActiveCoatLightboxSource();

  assert.match(component, /const activeCoatLightboxCloseRef = useRef<View>\(null\)/);
  const focusHandlerPattern = /function focusActiveCoatLightboxCloseTarget\(\) \{\s*const nodeHandle = findNodeHandle\(activeCoatLightboxCloseRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/;
  assert.match(component, focusHandlerPattern);
  assert.doesNotMatch(
    `function focusActiveCoatLightboxCloseTarget() {}\nfunction unusedDecoy() {\n  const nodeHandle = findNodeHandle(activeCoatLightboxCloseRef.current);\n  if (nodeHandle !== null) AccessibilityInfo.setAccessibilityFocus(nodeHandle);\n}`,
    focusHandlerPattern,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{coatExpanded\}[^>]*onShow=\{focusActiveCoatLightboxCloseTarget\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{activeCoatLightboxCloseRef\}\s+accessibilityRole="button"\s+accessibilityViewIsModal\s+accessibilityLabel="Close enlarged Coat of Arms"/,
  );
});
