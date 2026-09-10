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

test("native account-deletion buttons expose their disabled state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const buttons = [...source.matchAll(/<Pressable\b[\s\S]*?>/g)]
    .map((match) => match[0])
    .filter((button) => button.includes('accessibilityLabel="Permanently delete account"'));

  assert.equal(buttons.length, 2, "Expected both account states to render a permanent-deletion button");
  for (const button of buttons) {
    assert.match(
      button,
      /accessibilityState=\{\{ disabled: deleteConfirmation !== "DELETE MY ACCOUNT" \|\| deletingAccount \}\}/,
    );
  }
});
