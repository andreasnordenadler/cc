import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

function componentSource(name: string, nextName: string) {
  const start = appSource.indexOf(`function ${name}`);
  const end = appSource.indexOf(`function ${nextName}`, start + 1);
  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must follow ${name}`);
  return appSource.slice(start, end);
}

test("mobile form scroll containers keep submit controls responsive while the keyboard is open", () => {
  const shellSource = componentSource("MobileShell", "FixedScreenCloseButton");
  const sharedScrollSource = componentSource("ScrollHintedScrollView", "SpinningRefreshIcon");

  assert.match(shellSource, /<ScrollView[\s\S]*?keyboardShouldPersistTaps="handled"/);
  assert.match(sharedScrollSource, /<ScrollView[\s\S]*?keyboardShouldPersistTaps="handled"/);
});

test("mobile form scroll containers adjust their visible insets for the iOS keyboard", () => {
  const shellSource = componentSource("MobileShell", "FixedScreenCloseButton");
  const sharedScrollSource = componentSource("ScrollHintedScrollView", "SpinningRefreshIcon");

  assert.match(shellSource, /<ScrollView[\s\S]*?automaticallyAdjustKeyboardInsets=\{Platform\.OS === "ios"\}/);
  assert.match(sharedScrollSource, /<ScrollView[\s\S]*?automaticallyAdjustKeyboardInsets=\{Platform\.OS === "ios"\}/);
});

test("horizontal form filter strips keep their actions responsive while the keyboard is open", () => {
  const horizontalScrollViews = appSource.match(/<ScrollView\s+horizontal[\s\S]*?>/g) ?? [];

  assert.equal(horizontalScrollViews.length, 3);
  for (const scrollView of horizontalScrollViews) {
    assert.match(scrollView, /keyboardShouldPersistTaps="handled"/);
  }
});
