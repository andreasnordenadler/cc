import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native live-board loading state is announced as busy progress", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const loadingStart = source.indexOf("{shell.loading ? (");
  const loadingEnd = source.indexOf(") : null}", loadingStart);

  assert.notEqual(loadingStart, -1);
  assert.notEqual(loadingEnd, -1);

  const loadingState = source.slice(loadingStart, loadingEnd);
  assert.match(
    loadingState,
    /<View\s+accessible\s+accessibilityRole="progressbar"\s+accessibilityLabel="Loading the live quest board"\s+accessibilityLiveRegion="polite"\s+accessibilityState=\{\{ busy: true \}\}\s+style=\{styles\.loadingCard\}\s*>/,
  );
});
