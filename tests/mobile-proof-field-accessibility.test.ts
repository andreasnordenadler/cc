import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native specific-proof fields expose an explicit screen-reader label", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const inputs = [...source.matchAll(/<TextInput\b[\s\S]*?\/>/g)]
    .map((match) => match[0])
    .filter((input) => input.includes("value={proofGameReference}"));

  assert.equal(inputs.length, 2, "Expected official and custom Side Quest proof fields");
  for (const input of inputs) {
    assert.match(input, /accessibilityLabel="Specific proof game"/);
  }
});

test("native Solo Side Quest actions expose their disabled state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const buttons = [...source.matchAll(/<Pressable\b[\s\S]*?>/g)].map((match) => match[0]);
  const expectedStates = new Map([
    ["Check latest game", "actionState.busy"],
    ["Submit specific game proof", "actionState.busy"],
    ["Deactivate quest", "actionState.busy"],
    ["Start this Side Quest", "actionState.busy"],
    ["Check latest game for custom Side Quest", "Boolean(proofBusy)"],
    ["Submit specific game proof for custom Side Quest", "Boolean(proofBusy)"],
    ["Deactivate custom Side Quest", "Boolean(proofBusy)"],
    ["Pick custom Side Quest", "busy || !canStart"],
  ]);

  for (const [label, disabledExpression] of expectedStates) {
    const matches = buttons.filter((button) => button.includes(`accessibilityLabel="${label}"`));
    assert.equal(matches.length, 1, `Expected one ${label} button`);
    assert.match(
      matches[0],
      new RegExp(`accessibilityState=\\{\\{ disabled: ${disabledExpression.replace(/[()|!.]/g, "\\$&")} \\}\\}`),
      `${label} must expose the same disabled state used by its interaction guard`,
    );
  }
});
