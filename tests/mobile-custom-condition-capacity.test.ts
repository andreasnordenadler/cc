import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("custom condition capacity reserves an open new condition without evicting saved conditions", async () => {
  const imported = await import("../apps/mobile/src/custom/customConditionCapacity").catch(() => ({}));
  const capacity = imported as {
    MAX_CUSTOM_CONDITIONS?: number;
    getCustomConditionSlotCount?: (savedCount: number, editorOpen: boolean, editingId: string | null) => number;
    prependCustomCondition?: <T>(current: readonly T[], condition: T, reservedSlots?: number) => T[] | null;
  };

  assert.equal(typeof capacity.getCustomConditionSlotCount, "function");
  assert.equal(typeof capacity.prependCustomCondition, "function");
  assert.equal(capacity.MAX_CUSTOM_CONDITIONS, 6);
  assert.equal(capacity.getCustomConditionSlotCount?.(5, true, null), 6);
  assert.equal(capacity.getCustomConditionSlotCount?.(6, true, "condition-a"), 6);

  const saved = ["a", "b", "c", "d", "e"];
  assert.deepEqual(capacity.prependCustomCondition?.(saved, "new"), ["new", ...saved]);
  const full = ["a", "b", "c", "d", "e", "f"];
  assert.equal(capacity.prependCustomCondition?.(full, "new"), null);
  assert.deepEqual(full, ["a", "b", "c", "d", "e", "f"]);

  let queued = ["a", "b", "c", "d"];
  queued = capacity.prependCustomCondition?.(queued, "duplicate-1", 1) ?? queued;
  queued = capacity.prependCustomCondition?.(queued, "duplicate-2", 1) ?? queued;
  assert.deepEqual(queued, ["duplicate-1", "a", "b", "c", "d"]);
  assert.deepEqual(capacity.prependCustomCondition?.(queued, "pending-editor"), ["pending-editor", ...queued]);
});

test("custom condition state atomically reserves capacity across add and duplicate actions", async () => {
  const imported = await import("../apps/mobile/src/custom/customConditionCapacity");
  const transition = imported.transitionCustomConditionState;
  const fiveSaved = {
    conditions: ["a", "b", "c", "d", "e"].map((id) => ({ id })),
    editorOpen: false,
    editingId: null,
  };

  const addFirst = transition(fiveSaved, { type: "open-new" });
  assert.equal(addFirst.accepted, true);
  assert.equal(addFirst.state.editorOpen, true);
  const duplicateAfterAdd = transition(addFirst.state, { type: "duplicate", condition: { id: "duplicate" } });
  assert.equal(duplicateAfterAdd.accepted, false);
  assert.deepEqual(duplicateAfterAdd.state.conditions, fiveSaved.conditions);

  const duplicateFirst = transition(fiveSaved, { type: "duplicate", condition: { id: "duplicate" } });
  assert.equal(duplicateFirst.accepted, true);
  assert.deepEqual(duplicateFirst.state.conditions, [{ id: "duplicate" }, ...fiveSaved.conditions]);
  const addAfterDuplicate = transition(duplicateFirst.state, { type: "open-new" });
  assert.equal(addAfterDuplicate.accepted, false);
  assert.equal(addAfterDuplicate.state.editorOpen, false);
});

test("custom condition state saves an open condition after a queued duplicate without data loss", async () => {
  const { transitionCustomConditionState: transition } = await import("../apps/mobile/src/custom/customConditionCapacity");
  const openEditor = {
    conditions: ["a", "b", "c", "d"].map((id) => ({ id })),
    editorOpen: true,
    editingId: null,
  };

  const duplicated = transition(openEditor, { type: "duplicate", condition: { id: "duplicate" } });
  assert.equal(duplicated.accepted, true);
  const saved = transition(duplicated.state, { type: "save", condition: { id: "new" } });

  assert.equal(saved.accepted, true);
  assert.equal(saved.state.editorOpen, false);
  assert.equal(saved.state.editingId, null);
  assert.deepEqual(saved.state.conditions.map((condition) => condition.id), ["new", "duplicate", "a", "b", "c", "d"]);
});

test("custom condition state edits an existing condition at capacity without adding a slot", async () => {
  const { transitionCustomConditionState: transition } = await import("../apps/mobile/src/custom/customConditionCapacity");
  const fullEditor = {
    conditions: ["a", "b", "c", "d", "e", "f"].map((id) => ({ id, value: `old-${id}` })),
    editorOpen: true,
    editingId: "c",
  };

  const saved = transition(fullEditor, { type: "save", condition: { id: "ignored", value: "updated-c" } });

  assert.equal(saved.accepted, true);
  assert.equal(saved.state.editorOpen, false);
  assert.equal(saved.state.editingId, null);
  assert.equal(saved.state.conditions.length, 6);
  assert.deepEqual(saved.state.conditions[2], { id: "c", value: "updated-c" });
});

test("native custom builders stop add and duplicate actions at six saved conditions", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.equal(
    source.match(/accessibilityLabel=\{`Duplicate \$\{getCustomConditionLabel\(index\)\}`\}\s+accessibilityState=\{\{ disabled: customConditionSlotCount >= MAX_CUSTOM_CONDITIONS \}\}\s+disabled=\{customConditionSlotCount >= MAX_CUSTOM_CONDITIONS\}/g)?.length ?? 0,
    2,
    "Every repeated duplicate action must expose its disabled state at capacity",
  );
  assert.equal(
    source.match(/!customConditionEditorOpen && customRequirements\.length && customRequirements\.length < MAX_CUSTOM_CONDITIONS/g)?.length ?? 0,
    2,
    "Neither custom builder may offer another condition after reaching capacity",
  );
  assert.equal(
    source.match(/Maximum of six conditions reached\./g)?.length ?? 0,
    2,
    "Both custom builders must explain why add and duplicate actions are unavailable",
  );
  assert.doesNotMatch(
    source,
    /setCustomRequirements\(\(current\) => \[\{ \.\.\.requirement, id: `draft-condition-\$\{customRequirementIdCounter\.current\}` \}, \.\.\.current\]\.slice\(0, 6\)\);/,
    "Duplicating must never evict a different saved condition through truncation",
  );
});

test("native custom builders apply capacity transitions from one synchronous state", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(source, /transitionCustomConditionState, type CustomConditionState/);
  assert.equal(
    source.match(/const customConditionStateRef = useRef<CustomConditionState<CustomRuleRequirement>>\(/g)?.length ?? 0,
    2,
    "Both builders need one synchronous condition-state authority",
  );
  assert.equal(
    source.match(/function applyCustomConditionState\(next: CustomConditionState<CustomRuleRequirement>\)/g)?.length ?? 0,
    2,
    "Both builders must update React state from the same accepted transition",
  );
  assert.equal(
    source.match(/transitionCustomConditionState\(customConditionStateRef\.current, \{ type: "open-new" \}\)/g)?.length ?? 0,
    2,
    "Add must reserve capacity against the latest transition state",
  );
  assert.equal(
    source.match(/transitionCustomConditionState\(customConditionStateRef\.current, \{ type: "duplicate", condition: duplicate \}\)/g)?.length ?? 0,
    2,
    "Duplicate must reserve capacity against the latest transition state",
  );
  assert.equal(
    source.match(/transitionCustomConditionState\(customConditionStateRef\.current, \{ type: "save", condition:/g)?.length ?? 0,
    2,
    "Save and publish projections must include all previously accepted transitions",
  );
});
