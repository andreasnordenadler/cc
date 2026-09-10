import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function textInputsForValue(source: string, value: string) {
  const matches = [...source.matchAll(/<TextInput\b[\s\S]*?\/>/g)]
    .map((match) => match[0])
    .filter((input) => input.includes(`value={${value}}`));

  assert.equal(matches.length, 2, `Expected two custom-builder TextInputs bound to ${value}`);
  return matches;
}

test("native custom Side Quest fields expose explicit screen-reader labels", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const fields = [
    ["customQuestName", "Side Quest name"],
    ["customRuleTargetSquare", "Square"],
    ["customRuleMoveSequence", "Move sequence"],
    ["customRuleOpeningSequence", "Opening sequence"],
    ["customRuleMoveNumber", "Move number"],
  ] as const;

  for (const [value, label] of fields) {
    for (const input of textInputsForValue(source, value)) {
      assert.match(input, new RegExp(`accessibilityLabel="${label}"`));
    }
  }
});
