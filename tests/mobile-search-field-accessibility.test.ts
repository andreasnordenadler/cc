import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function textInputForValue(source: string, value: string) {
  const matches = [...source.matchAll(/<TextInput\b[\s\S]*?\/>/g)]
    .map((match) => match[0])
    .filter((input) => input.includes(`value={${value}}`));

  assert.ok(matches.length > 0, `Expected a TextInput bound to ${value}`);
  return matches;
}

test("native catalog search fields expose explicit screen-reader labels", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  const soloSearchInputs = textInputForValue(source, "communitySearch");
  assert.equal(soloSearchInputs.length, 2);
  assert.match(soloSearchInputs[0], /accessibilityLabel="Search Community Solo Side Quests"/);
  assert.match(soloSearchInputs[1], /accessibilityLabel="Search My Custom Side Quests"/);

  const multiplayerSearchInputs = textInputForValue(source, "multiplayerCommunitySearch");
  assert.equal(multiplayerSearchInputs.length, 1);
  assert.match(multiplayerSearchInputs[0], /accessibilityLabel="Search Community Multiplayer Side Quests"/);

  const creatorSearchInputs = textInputForValue(source, "createQuestSearch");
  assert.equal(creatorSearchInputs.length, 1);
  assert.match(creatorSearchInputs[0], /accessibilityLabel="Search Side Quests to add"/);
});
