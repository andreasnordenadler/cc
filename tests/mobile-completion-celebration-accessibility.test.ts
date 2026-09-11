import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCompletionCelebrationOverlaySource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function CompletionCelebrationOverlay");
  const componentEnd = source.indexOf("function CelebrationParticles", componentStart);
  const modalStart = source.indexOf("<Modal visible transparent", componentStart);
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

test("native completion celebration contains screen-reader navigation", async () => {
  const { modal } = await readCompletionCelebrationOverlaySource();

  assert.match(
    modal,
    /<View\s+style=\{compactStyles\.celebrationBackdrop\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native completion celebration", async () => {
  const { modal } = await readCompletionCelebrationOverlaySource();

  assert.match(
    modal,
    /<Modal\s+visible\s+transparent[^>]*onRequestClose=\{onClose\}[^>]*>/,
  );
  assert.match(
    modal,
    /<View\s+style=\{compactStyles\.celebrationBackdrop\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{onClose\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close celebration"[^>]*onPress=\{onClose\}[^>]*>/,
  );
});

test("native completion celebration moves screen-reader focus to its close button", async () => {
  const { component, modal } = await readCompletionCelebrationOverlaySource();

  assert.match(component, /const celebrationCloseButtonRef = useRef<View>\(null\)/);
  const focusHandlerPattern = /function focusCelebrationCloseButton\(\) \{\s*const nodeHandle = findNodeHandle\(celebrationCloseButtonRef\.current\);\s*if \(nodeHandle !== null\) AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\);\s*\}/;
  assert.match(component, focusHandlerPattern);
  assert.doesNotMatch(
    `function focusCelebrationCloseButton() {}\nfunction unusedDecoy() {\n  const nodeHandle = findNodeHandle(celebrationCloseButtonRef.current);\n  if (nodeHandle !== null) AccessibilityInfo.setAccessibilityFocus(nodeHandle);\n}`,
    focusHandlerPattern,
  );
  assert.match(
    modal,
    /<Modal\s+visible\s+transparent[^>]*onShow=\{focusCelebrationCloseButton\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{celebrationCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close celebration"/,
  );
});
