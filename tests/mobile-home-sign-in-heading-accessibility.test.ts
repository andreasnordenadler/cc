import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native signed-out Home exposes its sign-in prompt as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function TodayDashboard(");
  const dashboardEnd = source.indexOf("function QuestBoardDashboard(", dashboardStart);

  assert.notEqual(dashboardStart, -1, "Expected TodayDashboard");
  assert.notEqual(dashboardEnd, -1, "Expected the next component after TodayDashboard");

  const dashboard = source.slice(dashboardStart, dashboardEnd);
  assert.match(
    dashboard,
    /<Text accessibilityRole="header" style=\{\[compactStyles\.freshSectionTitle, compactStyles\.centerText\]\}>Sign in to continue\.<\/Text>/,
  );
});
