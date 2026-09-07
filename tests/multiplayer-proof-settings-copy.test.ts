import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checkedCopyByPath = {
  "src/components/group-quest-draft-builder.tsx": "Automatic checks enforce the Side Quest objective, selected provider, time control, rated or casual setting, player color, required result, and event window.",
  "src/components/group-quest-edit-form.tsx": "Automatic checks enforce the Side Quest objective, selected provider, time control, rated or casual setting, player color, required result, and event window.",
  "src/components/mobile-multiplayer-create-form.tsx": "Automatic checks enforce the selected Side Quests, game provider, time control, rated or casual setting, player color, and event window.",
} as const;

test("Multiplayer create and edit forms truthfully describe enforced proof settings", () => {
  for (const [path, expectedCopy] of Object.entries(checkedCopyByPath)) {
    const source = readFileSync(path, "utf8");
    assert.ok(source.includes(expectedCopy), `${path} must state every enforced Multiplayer proof setting`);
    assert.ok(!source.includes("while verifier coverage expands"), `${path} must not describe enforced settings as future coverage`);
  }
});
