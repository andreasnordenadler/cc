import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Trophy Cabinet collection title exposes its visible state as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const componentStart = source.indexOf("function AccountTrackerDashboard(");
  const componentEnd = source.indexOf("function CoatOfArmsScreen(", componentStart);

  assert.notEqual(componentStart, -1, "Expected AccountTrackerDashboard component");
  assert.notEqual(componentEnd, -1, "Expected CoatOfArmsScreen after AccountTrackerDashboard");

  const trophyCabinet = source.slice(componentStart, componentEnd);
  assert.match(
    trophyCabinet,
    /<Text accessibilityRole="header" style=\{styles\.sectionTitle\}>\{signedInAccount\.completedQuests\.length \? "A deeply unnecessary trophy cabinet\." : "No completed side quests yet\."\}<\/Text>/,
    "the visible Trophy Cabinet collection title must be exposed as a screen-reader heading",
  );
});
