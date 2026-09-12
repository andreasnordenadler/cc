import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function componentSource(source: string, componentName: string, nextComponentName: string) {
  const start = source.indexOf(`function ${componentName}(`);
  const end = source.indexOf(`function ${nextComponentName}(`, start);

  assert.notEqual(start, -1, `Expected ${componentName}`);
  assert.notEqual(end, -1, `Expected ${nextComponentName} after ${componentName}`);
  return source.slice(start, end);
}

test("native Help and Support modal title exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const helpModal = componentSource(source, "HelpSupportModal", "CommunityMultiplayerReportModal");

  assert.match(
    helpModal,
    /<Text accessibilityRole="header" style=\{compactStyles\.detailTitle\}>How can we help\?<\/Text>/,
  );
});

test("native Community report modal title exposes a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const reportModal = componentSource(source, "CommunityMultiplayerReportModal", "HelpSupportRow");

  assert.match(
    reportModal,
    /<Text accessibilityRole="header" style=\{compactStyles\.detailTitle\}>Report this Side Quest<\/Text>/,
  );
});
