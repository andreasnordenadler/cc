import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Trophy Cabinet exposes the official Multiplayer trophy category as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function CoatBoardDashboard(");
  const dashboardEnd = source.indexOf("function SocialSignInButtonContent(", dashboardStart);

  assert.notEqual(dashboardStart, -1, "Expected CoatBoardDashboard");
  assert.notEqual(dashboardEnd, -1, "Expected the next component after CoatBoardDashboard");

  const dashboard = source.slice(dashboardStart, dashboardEnd);
  assert.match(
    dashboard,
    /<Text accessibilityRole="header" style=\{compactStyles\.multiplayerCardEyebrow\}>Official Multiplayer trophies<\/Text>/,
  );
});
