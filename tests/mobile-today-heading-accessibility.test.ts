import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native signed-out Home title exposes a screen-reader heading on the rendered dashboard", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function TodayDashboard(");
  const dashboardEnd = source.indexOf("function JoinedMultiplayerQuestModal(", dashboardStart);
  const activeScreenStart = source.indexOf("function ActiveScreen(");
  const activeScreenEnd = source.indexOf("function SideQuestsScreen(", activeScreenStart);

  assert.notEqual(dashboardStart, -1, "Expected TodayDashboard");
  assert.notEqual(dashboardEnd, -1, "Expected the next component after TodayDashboard");
  assert.notEqual(activeScreenStart, -1, "Expected ActiveScreen");
  assert.notEqual(activeScreenEnd, -1, "Expected the next component after ActiveScreen");

  const dashboard = source.slice(dashboardStart, dashboardEnd);
  const activeScreen = source.slice(activeScreenStart, activeScreenEnd);
  assert.match(activeScreen, /case "home":\s+return <TodayDashboard\b/);
  assert.match(
    dashboard,
    /<Text accessibilityRole="header" style=\{\[compactStyles\.freshTitle, compactStyles\.centerText\]\}>Side Quest Chess<\/Text>/,
  );
});
