import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readGlobalMenuSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function GlobalHamburgerMenu");
  const end = source.indexOf("function ScrollHintOverlay", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return { appSource: source, menuSource: source.slice(start, end) };
}

test("native main menu moves screen-reader focus inside when shown", async () => {
  const { appSource, menuSource } = await readGlobalMenuSource();

  assert.match(appSource, /\bAccessibilityInfo\b/);
  assert.match(appSource, /\bfindNodeHandle\b/);
  assert.match(menuSource, /const firstMenuItemRef = useRef<View>\(null\)/);
  assert.match(menuSource, /function focusFirstMenuItem\(\)[\s\S]*findNodeHandle\(firstMenuItemRef\.current\)[\s\S]*AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\)/);
  assert.match(menuSource, /<Modal\s[^>]*onShow=\{focusFirstMenuItem\}[^>]*>/);
  assert.match(menuSource, /<View\s[^>]*accessibilityViewIsModal[^>]*>/);
  assert.match(menuSource, /ref=\{index === 0 \? firstMenuItemRef : undefined\}/);
});

test("dismissing the native main menu restores screen-reader focus to its trigger", async () => {
  const { menuSource } = await readGlobalMenuSource();

  assert.match(menuSource, /const menuTriggerRef = useRef<View>\(null\)/);
  assert.match(menuSource, /const restoreMenuTriggerFocusRef = useRef\(false\)/);
  assert.match(menuSource, /const restoreMenuTriggerFrameRef = useRef<ReturnType<typeof requestAnimationFrame> \| null>\(null\)/);
  assert.match(menuSource, /function restoreMenuTriggerFocus\(\)[\s\S]*restoreMenuTriggerFocusRef\.current = false;[\s\S]*findNodeHandle\(menuTriggerRef\.current\)[\s\S]*AccessibilityInfo\.setAccessibilityFocus\(nodeHandle\)/);
  assert.match(menuSource, /function dismissMenu\(\)[\s\S]*restoreMenuTriggerFocusRef\.current = true;[\s\S]*setMenuOpen\(false\);[\s\S]*Platform\.OS !== "ios"[\s\S]*requestAnimationFrame\(restoreMenuTriggerFocus\)/);
  assert.match(menuSource, /useEffect\(\(\) => \(\) => \{[\s\S]*cancelAnimationFrame\(restoreMenuTriggerFrameRef\.current\)/);
  assert.match(menuSource, /<Pressable\s+ref=\{menuTriggerRef\}[^>]*onPress=\{\(\) => setMenuOpen\(true\)\}[^>]*>/);
  assert.match(menuSource, /<Modal\s[^>]*onDismiss=\{restoreMenuTriggerFocus\}[^>]*onRequestClose=\{dismissMenu\}[^>]*>/);
  assert.match(menuSource, /<View style=\{\[compactStyles\.homeMenuOverlay[^>]*accessibilityViewIsModal[^>]*>[\s\S]*accessibilityLabel="Close main menu" onPress=\{dismissMenu\}/);
  assert.match(menuSource, /ref=\{index === 0 \? firstMenuItemRef : undefined\}[^>]*onAccessibilityEscape=\{dismissMenu\}/);
});

test("accessibility escape dismisses the native main menu from any focused child", async () => {
  const { menuSource } = await readGlobalMenuSource();

  assert.match(
    menuSource,
    /<View style=\{\[compactStyles\.homeMenuOverlay[^>]*accessibilityViewIsModal[^>]*onAccessibilityEscape=\{dismissMenu\}[^>]*>/,
  );
});
