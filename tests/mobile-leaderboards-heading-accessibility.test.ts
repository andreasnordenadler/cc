import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Official Leaderboards titles expose screen-reader headings in both account states", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function OfficialMultiplayerLeaderboardsScreen(");
  const end = source.indexOf("function getChallengesByIds(", start);

  assert.notEqual(start, -1, "Expected OfficialMultiplayerLeaderboardsScreen");
  assert.notEqual(end, -1, "Expected the next component after OfficialMultiplayerLeaderboardsScreen");

  const leaderboardsScreen = source.slice(start, end);
  const titles = [
    ...leaderboardsScreen.matchAll(/<Text\b[^>]*style=\{styles\.groupquestsHeroTitle\}[^>]*>Official Leaderboards\.<\/Text>/g),
  ].map((match) => match[0]);

  assert.equal(titles.length, 2, "Expected signed-out and signed-in Official Leaderboards titles");
  for (const title of titles) {
    assert.match(title, /accessibilityRole="header"/);
  }
});
