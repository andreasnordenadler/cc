import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native Multiplayer explainer sections expose screen-reader headings", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf('<Pressable accessibilityRole="button" accessibilityLabel="Toggle Multiplayer Side Quest explainer"');
  const end = source.indexOf("function OfficialMultiplayerLeaderboardsScreen(", start);

  assert.notEqual(start, -1, "Expected the Multiplayer explainer trigger");
  assert.notEqual(end, -1, "Expected OfficialMultiplayerLeaderboardsScreen after the explainer");

  const explainer = source.slice(start, end);
  for (const title of [
    "A tiny chess tournament for bad ideas.",
    "Create. Invite. Play. Prove.",
    "Personal proof and multiplayer proof are different ledgers.",
  ]) {
    assert.match(
      explainer,
      new RegExp(`<Text accessibilityRole="header" style=\\{styles\\.sectionTitle\\}>${title.replace(/[.?]/g, "\\$&")}<\\/Text>`),
      `${title} must be exposed as a screen-reader heading`,
    );
  }
});
