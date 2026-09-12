import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Trophy Cabinet title exposes a screen-reader heading on the rendered dashboard", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function CoatBoardDashboard(");
  const dashboardEnd = source.indexOf("function SocialSignInButtonContent(", dashboardStart);
  const activeScreenStart = source.indexOf("function ActiveScreen(");
  const activeScreenEnd = source.indexOf("function SideQuestsScreen(", activeScreenStart);

  assert.notEqual(dashboardStart, -1, "Expected CoatBoardDashboard");
  assert.notEqual(dashboardEnd, -1, "Expected the next component after CoatBoardDashboard");
  assert.notEqual(activeScreenStart, -1, "Expected ActiveScreen");
  assert.notEqual(activeScreenEnd, -1, "Expected the next component after ActiveScreen");

  const dashboard = source.slice(dashboardStart, dashboardEnd);
  const activeScreen = source.slice(activeScreenStart, activeScreenEnd);
  assert.match(activeScreen, /case "coatOfArms":\s+return <CoatBoardDashboard\b/);
  assert.match(
    dashboard,
    /<Text accessibilityRole="header" style=\{compactStyles\.multiplayerCardEyebrow\}>Trophy Cabinet<\/Text>/,
  );
});
