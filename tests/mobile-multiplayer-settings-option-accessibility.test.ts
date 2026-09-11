import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readOwnerSettingsSource() {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<Text style={compactStyles.multiplayerCardEyebrow}>Owner settings</Text>");
  const end = source.indexOf("<GroupQuestDateTimeControl label=\"Start\"", start);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("native Multiplayer visibility choices expose one labeled radio group", async () => {
  const source = await readOwnerSettingsSource();
  const start = source.indexOf("<Text style={styles.inputLabel}>Visibility</Text>");
  const end = source.indexOf("<Text style={styles.inputLabel}>Games allowed</Text>", start);
  assert.notEqual(start, -1);
  assert.ok(end > start);
  const visibilityChoices = source.slice(start, end);

  assert.match(
    visibilityChoices,
    /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Multiplayer visibility">/,
  );
  assert.match(
    visibilityChoices,
    /<Pressable key=\{modeOption\} accessibilityRole="radio" accessibilityLabel=\{`Multiplayer visibility: \$\{copy\.title\}\. \$\{copy\.helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
  );
  assert.doesNotMatch(visibilityChoices, /accessibilityState=\{\{ selected \}\}/);
});

test("native Multiplayer game-provider choices expose one labeled radio group", async () => {
  const source = await readOwnerSettingsSource();
  const start = source.indexOf("<Text style={styles.inputLabel}>Games allowed</Text>");
  assert.notEqual(start, -1);
  const gamesAllowedChoices = source.slice(start);

  assert.match(
    gamesAllowedChoices,
    /<View style=\{compactStyles\.multiplayerOptionGrid\} accessibilityRole="radiogroup" accessibilityLabel="Allowed chess providers">/,
  );
  assert.match(
    gamesAllowedChoices,
    /<Pressable key=\{modeOption\.id\} accessibilityRole="radio" accessibilityLabel=\{`Allowed chess providers: \$\{title\}\. \$\{helper\}`\} accessibilityState=\{\{ checked: selected \}\}/,
  );
  assert.doesNotMatch(gamesAllowedChoices, /accessibilityState=\{\{ selected \}\}/);
});
