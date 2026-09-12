import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readEarlierOfficialResultsModalSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function MultiplayerSideQuestsScreen");
  const componentEnd = source.indexOf("function OfficialMultiplayerLeaderboardsScreen", componentStart);
  const modalStart = source.indexOf(
    "<Modal visible={Boolean(officialWeek)}",
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

test("native earlier official results modal contains screen-reader navigation", async () => {
  const { modal } = await readEarlierOfficialResultsModalSource();

  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal(?:\s|>)/,
  );
});

test("accessibility escape closes the native earlier official results modal", async () => {
  const { component, modal } = await readEarlierOfficialResultsModalSource();

  assert.match(
    component,
    /function closeOfficialWeek\(\) \{\s*setOfficialWeekId\(null\);\s*\}/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(officialWeek\)\}[^>]*onRequestClose=\{closeOfficialWeek\}[^>]*>/,
  );
  assert.match(
    modal,
    /<SafeAreaView\s+style=\{compactStyles\.detailScreen\}\s+accessibilityViewIsModal\s+onAccessibilityEscape=\{closeOfficialWeek\}\s*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+[^>]*accessibilityLabel="Close earlier official results"[^>]*onPress=\{closeOfficialWeek\}[^>]*>/,
  );
});

test("native earlier official results modal moves screen-reader focus to its close button", async () => {
  const { component, modal } = await readEarlierOfficialResultsModalSource();

  assert.match(component, /const officialWeekCloseButtonRef = useRef<View>\(null\)/);
  assert.match(
    component,
    /const officialWeekModalAccessibility = createModalAccessibilityController\(\{[\s\S]*dismiss: closeOfficialWeek,[\s\S]*getInitialFocusTarget: \(\) => officialWeekCloseButtonRef\.current,[\s\S]*findNodeHandle,[\s\S]*setAccessibilityFocus: AccessibilityInfo\.setAccessibilityFocus,[\s\S]*\}\);/,
  );
  assert.match(
    modal,
    /<Modal\s+visible=\{Boolean\(officialWeek\)\}[^>]*onShow=\{officialWeekModalAccessibility\.focusInitial\}[^>]*>/,
  );
  assert.match(
    modal,
    /<Pressable\s+ref=\{officialWeekCloseButtonRef\}\s+accessibilityRole="button"\s+accessibilityLabel="Close earlier official results"/,
  );
});

test("native earlier official results title exposes a screen-reader heading", async () => {
  const { modal } = await readEarlierOfficialResultsModalSource();

  assert.match(
    modal,
    /<Text accessibilityRole="header" style=\{compactStyles\.detailTitle\}>\{officialWeek\?\.label\}<\/Text>/,
  );
});
