import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Trophy Cabinet exposes every remaining reward category as a screen-reader heading", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function CoatBoardDashboard(");
  const dashboardEnd = source.indexOf("function SocialSignInButtonContent(", dashboardStart);

  assert.notEqual(dashboardStart, -1, "Expected CoatBoardDashboard");
  assert.notEqual(dashboardEnd, -1, "Expected the next component after CoatBoardDashboard");

  const dashboard = source.slice(dashboardStart, dashboardEnd);
  for (const category of [
    "Unlocked Solo Side Quest rewards",
    "Community Multiplayer trophies",
    "Official Solo Side Quest collection",
  ]) {
    assert.match(
      dashboard,
      new RegExp(`<Text accessibilityRole="header" style=\\{compactStyles\\.multiplayerCardEyebrow\\}>${category}<\\/Text>`),
      `${category} must be exposed as a screen-reader heading`,
    );
  }
});
