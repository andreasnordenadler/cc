import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native account-deletion confirmation fields expose an explicit screen-reader label", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const inputs = [...source.matchAll(/<TextInput\b[\s\S]*?\/>/g)]
    .map((match) => match[0])
    .filter((input) => input.includes("value={deleteConfirmation}"));

  assert.equal(inputs.length, 2, "Expected both account states to render a deletion confirmation field");
  for (const input of inputs) {
    assert.match(input, /accessibilityLabel="Account deletion confirmation"/);
  }
});
