import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readCreateSettingsSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<Text style={styles.inputLabel}>Access</Text>");
  const end = source.indexOf("<GroupQuestDateTimeControl label=\"Start\" value={createStartAt}", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

async function readCreateAdvancedSettingsSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("{createAdvancedOpen ? Object.entries(MULTIPLAYER_RULE_OPTIONS)");
  const end = source.indexOf("<Pressable accessibilityRole=\"button\" accessibilityLabel=\"Toggle advanced Multiplayer game settings\"", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Multiplayer creation access choices expose one labeled radio group", async () => {
  const source = await readCreateSettingsSource();
  const start = source.indexOf("<Text style={styles.inputLabel}>Access</Text>");
  const end = source.indexOf("<Text style={styles.inputLabel}>Games allowed</Text>", start);
  assert.notEqual(start, -1);
  assert.ok(end > start);
  const accessChoices = source.slice(start, end);

  assert.match(
    accessChoices,
    /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Multiplayer access">/,
  );
  assert.match(
    accessChoices,
    /<Pressable key=\{mode\} accessibilityRole="radio" accessibilityLabel=\{`Multiplayer access: \$\{copy\.title\}\. \$\{copy\.helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
  );
  assert.doesNotMatch(accessChoices, /accessibilityState=\{\{ selected \}\}/);
});

test("native Multiplayer creation game-provider choices expose one labeled radio group", async () => {
  const source = await readCreateSettingsSource();
  const start = source.indexOf("<Text style={styles.inputLabel}>Games allowed</Text>");
  assert.notEqual(start, -1);
  const gamesAllowedChoices = source.slice(start);

  assert.match(
    gamesAllowedChoices,
    /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Allowed chess providers">/,
  );
  assert.match(
    gamesAllowedChoices,
    /<Pressable key=\{mode\.id\} accessibilityRole="radio" accessibilityLabel=\{`Allowed chess providers: \$\{title\}\. \$\{helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
  );
  assert.doesNotMatch(gamesAllowedChoices, /accessibilityState=\{\{ selected \}\}/);
});

test("native Multiplayer creation advanced rules expose labeled radio groups", async () => {
  const source = await readCreateAdvancedSettingsSource();

  assert.match(
    source,
    /const groupLabel = ruleId === "timeControl" \? "Multiplayer time control" : ruleId === "rated" \? "Multiplayer rated setting" : "Multiplayer player color";/,
  );
  assert.match(
    source,
    /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel=\{groupLabel\}>/,
  );
  assert.match(
    source,
    /<Pressable key=\{option\} accessibilityRole="radio" accessibilityLabel=\{`\$\{groupLabel\}: \$\{copy\.title\}\. \$\{copy\.helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
  );
  assert.doesNotMatch(source, /accessibilityState=\{\{ selected \}\}/);
});
